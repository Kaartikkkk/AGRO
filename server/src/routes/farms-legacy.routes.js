const express = require('express');
const farmController = require('../controllers/farms.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/multer.middleware');

const router = express.Router();

// General farm plot management
router.route('/')
  .get(protect, farmController.getFarms)
  .post(protect, farmController.addFarm);

// Crop Disease Diagnosis
router.route('/diagnose')
  .post(protect, upload.single('image'), farmController.diagnoseCropDisease);

// Specific farm plot actions (Update/Delete)
router.route('/:id')
  .put(protect, farmController.updateFarmData)
  .delete(protect, farmController.deleteFarm);

// Fertilizer Recommendation Logic
router.route('/:id/recommendation')
  .post(protect, farmController.getRecommendation);

// AI Recommendations
router.route('/:id/recommendations')
  .get(protect, farmController.getFarmRecommendations);

module.exports = router;
