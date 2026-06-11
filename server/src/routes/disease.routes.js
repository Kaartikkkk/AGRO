const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { protect } = require('../middleware/auth.middleware');
const { DiseaseScan, FarmNew } = require('../models');

const router = express.Router();

// Memory storage configuration for Multer (keeps file in buffer)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Use JPG, PNG, or WEBP'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper: Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// All endpoints in this router are protected by JWT auth
router.use(protect);

/**
 * @route   POST /api/disease/predict
 * @desc    Receive image + symptoms, save copy, proxy to Flask, save history
 */
router.post('/predict', (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Max 10MB' });
      }
      return res.status(400).json({ error: err.message });
    }

    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No image provided' });
      }

      const symptoms = req.body.symptoms || '';
      const cropType = req.body.cropType || '';
      const farmId = req.body.farmId || null;

      // 1. Prepare Multipart Form Data to forward to Flask AI Server
      const form = new FormData();
      form.append('image', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
      });
      form.append('symptoms', symptoms);
      form.append('crop_type', cropType);

      const flaskUrl = process.env.FLASK_AI_URL || 'http://localhost:5001';
      
      // 2. Call Flask AI Server prediction endpoint (timeout 30s)
      let predictionResult;
      try {
        const response = await axios.post(`${flaskUrl}/predict`, form, {
          headers: {
            ...form.getHeaders()
          },
          timeout: 30000
        });
        predictionResult = response.data;
      } catch (flaskErr) {
        console.error('Flask server connection error:', flaskErr.message);
        return res.status(503).json({
          error: 'AI service temporarily unavailable. Please try again in a moment.'
        });
      }

      // 3. Save file buffer locally so we can reference it in history page
      const uniqueFilename = `disease-scan-${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
      const savePath = path.join(uploadsDir, uniqueFilename);
      await fs.promises.writeFile(savePath, file.buffer);

      // Save Grad-CAM image buffer locally
      let gradCamUrl = null;
      if (predictionResult.grad_cam_image) {
        try {
          const base64Data = predictionResult.grad_cam_image.split(',')[1];
          const gradCamBuffer = Buffer.from(base64Data, 'base64');
          const gradCamFilename = `gradcam-${uniqueFilename}`;
          const gradCamSavePath = path.join(uploadsDir, gradCamFilename);
          await fs.promises.writeFile(gradCamSavePath, gradCamBuffer);
          gradCamUrl = `/uploads/${gradCamFilename}`;
        } catch (gradCamWriteErr) {
          console.error('Failed to write Grad-CAM image to disk:', gradCamWriteErr.message);
        }
      }

      // 4. Save scan info to disease_scans table in Postgres
      const newScan = await DiseaseScan.create({
        user_id: req.user.id,
        farm_id: farmId || null,
        image_filename: uniqueFilename,
        crop_type: predictionResult.prediction.crop,
        disease_name: predictionResult.prediction.disease,
        confidence: predictionResult.prediction.confidence,
        severity: ['High', 'Medium', 'Low'].includes(predictionResult.prediction.severity) 
                  ? predictionResult.prediction.severity 
                  : 'Low', // default mapping check
        is_healthy: predictionResult.prediction.is_healthy,
        symptoms_text: symptoms || null,
        treatment_json: predictionResult.treatment,
        top_3_json: predictionResult.top_3,
        grad_cam_url: gradCamUrl || `/uploads/${uniqueFilename}`, // point to static file
        scan_date: new Date()
      });

      // 5. Respond back with prediction data + database record
      return res.status(200).json({
        ...predictionResult,
        scan_id: newScan.id,
        image_url: `/uploads/${uniqueFilename}`
      });

    } catch (e) {
      console.error('Predict route error:', e);
      return res.status(500).json({ error: 'Prediction failed', details: e.message });
    }
  });
});

/**
 * @route   POST /api/disease/save
 * @desc    Saves / Updates a scan record (e.g. link to a farm)
 */
router.post('/save', async (req, res) => {
  try {
    const { scanId, farmId } = req.body;
    if (!scanId) {
      return res.status(400).json({ error: 'scanId is required' });
    }

    const scan = await DiseaseScan.findOne({
      where: { id: scanId, user_id: req.user.id }
    });

    if (!scan) {
      return res.status(404).json({ error: 'Scan record not found' });
    }

    if (farmId) {
      // Validate farm exists and belongs to user
      const farm = await FarmNew.findOne({
        where: { id: farmId, userId: req.user.id }
      });
      if (!farm) {
        return res.status(400).json({ error: 'Invalid farm selection' });
      }
      scan.farm_id = farmId;
    } else {
      scan.farm_id = null;
    }

    await scan.save();
    return res.status(200).json({ success: true, scan });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to update scan record', details: e.message });
  }
});

/**
 * @route   GET /api/disease/history
 * @desc    Get the last 20 scans for the logged-in user
 */
router.get('/history', async (req, res) => {
  try {
    const scans = await DiseaseScan.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: FarmNew,
          attributes: ['id', 'plotName', 'city', 'district', 'state']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 20
    });

    return res.status(200).json(scans);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch scan history', details: e.message });
  }
});

/**
 * @route   GET /api/disease/health
 * @desc    Ping Flask health status and report
 */
router.get('/health', async (req, res) => {
  const flaskUrl = process.env.FLASK_AI_URL || 'http://localhost:5001';
  try {
    const response = await axios.get(`${flaskUrl}/health`, { timeout: 3000 });
    return res.status(200).json({
      online: true,
      ...response.data
    });
  } catch (e) {
    return res.status(200).json({
      online: false,
      error: 'AI service offline or starting up'
    });
  }
});

module.exports = router;
