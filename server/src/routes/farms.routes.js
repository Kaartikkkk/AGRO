const express = require('express');
const { body, validationResult } = require('express-validator');
const { FarmNew, CropRotation } = require('../models');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Input validation rules for creating/updating a plot
const farmValidationRules = [
  body('plotName').trim().notEmpty().withMessage('Plot Name is required'),
  body('size').isFloat({ min: 0.01 }).withMessage('Size must be a positive number'),
  body('sizeUnit').isIn(['acres', 'bigha', 'hectare']).withMessage('Invalid size unit'),
  body('landType').isIn(['irrigated', 'rain-fed', 'mixed']).withMessage('Invalid land type'),
  body('ownership').isIn(['owned', 'leased', 'shared']).withMessage('Invalid ownership type'),
  body('notes').optional({ nullable: true }).trim(),
  body('village').trim().notEmpty().withMessage('Village/Town is required'),
  body('district').trim().notEmpty().withMessage('District is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('pincode').trim().notEmpty().withMessage('Pincode is required'),
  body('latitude').optional({ nullable: true }).isFloat().withMessage('Latitude must be a number'),
  body('longitude').optional({ nullable: true }).isFloat().withMessage('Longitude must be a number'),
  body('currentCrop').trim().notEmpty().withMessage('Current Crop is required'),
  body('sowingDate').isDate().withMessage('Sowing date must be a valid date'),
  body('harvestDate').isDate().withMessage('Harvest date must be a valid date'),
  body('previousCrop').optional({ nullable: true }).trim(),
  body('irrigationSource').trim().notEmpty().withMessage('Irrigation source is required')
];

// Helper to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// 1. GET /api/farms - Get all plots for the logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const farms = await FarmNew.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(farms);
  } catch (error) {
    console.error('Error fetching farms:', error);
    res.status(500).json({ message: 'Failed to retrieve farms.' });
  }
});

// 2. POST /api/farms - Create new plot
router.post('/', protect, farmValidationRules, validate, async (req, res) => {
  try {
    const newPlot = await FarmNew.create({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json(newPlot);
  } catch (error) {
    console.error('Error creating plot:', error);
    res.status(500).json({ message: 'Failed to create new plot.' });
  }
});

// 3. GET /api/farms/:id - Get single plot with rotation history
router.get('/:id', protect, async (req, res) => {
  try {
    const farm = await FarmNew.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{
        model: CropRotation,
        as: 'CropRotations',
        order: [['sowingDate', 'DESC']]
      }]
    });

    if (!farm) {
      return res.status(404).json({ message: 'Plot not found' });
    }

    res.status(200).json(farm);
  } catch (error) {
    console.error('Error fetching plot details:', error);
    res.status(500).json({ message: 'Failed to retrieve plot details.' });
  }
});

// 4. PUT /api/farms/:id - Update plot
router.put('/:id', protect, farmValidationRules, validate, async (req, res) => {
  try {
    const farm = await FarmNew.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!farm) {
      return res.status(404).json({ message: 'Plot not found' });
    }

    await farm.update(req.body);
    res.status(200).json(farm);
  } catch (error) {
    console.error('Error updating plot:', error);
    res.status(500).json({ message: 'Failed to update plot.' });
  }
});

// 5. DELETE /api/farms/:id - Delete plot
router.delete('/:id', protect, async (req, res) => {
  try {
    const farm = await FarmNew.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!farm) {
      return res.status(404).json({ message: 'Plot not found' });
    }

    await farm.destroy();
    res.status(200).json({ message: 'Plot deleted successfully.' });
  } catch (error) {
    console.error('Error deleting plot:', error);
    res.status(500).json({ message: 'Failed to delete plot.' });
  }
});

// 6. POST /api/farms/:id/harvest - Mark current crop as harvested, move to rotation history
router.post('/:id/harvest', protect, async (req, res) => {
  try {
    const farm = await FarmNew.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!farm) {
      return res.status(404).json({ message: 'Plot not found' });
    }

    const currentCropName = farm.currentCrop;
    if (currentCropName === 'Fallow/Empty') {
      return res.status(400).json({ message: 'Plot is already in Fallow/Empty state.' });
    }

    // Automatically determine season name
    const sowingYear = new Date(farm.sowingDate).getFullYear();
    const seasonName = `${currentCropName} Season ${sowingYear}`;

    // Create a new crop rotation history record
    await CropRotation.create({
      farmId: farm.id,
      cropName: currentCropName,
      season: seasonName,
      sowingDate: farm.sowingDate,
      harvestDate: farm.harvestDate,
      yieldAmount: req.body.yieldAmount || null,
      yieldUnit: req.body.yieldUnit || null,
      notes: req.body.notes || 'Crop harvested successfully.'
    });

    // Update the farm plot crop state to Fallow/Empty
    await farm.update({
      previousCrop: currentCropName,
      currentCrop: 'Fallow/Empty',
      sowingDate: new Date().toISOString().split('T')[0],
      harvestDate: new Date().toISOString().split('T')[0]
    });

    // Fetch the updated farm with updated history list
    const updatedFarm = await FarmNew.findOne({
      where: { id: farm.id },
      include: [{ model: CropRotation, as: 'CropRotations' }]
    });

    res.status(200).json({
      message: 'Crop marked as harvested and added to history.',
      farm: updatedFarm
    });
  } catch (error) {
    console.error('Error harvesting crop:', error);
    res.status(500).json({ message: 'Failed to harvest crop.' });
  }
});

// 7. GET /api/farms/:id/rotation - Get full rotation history for a plot
router.get('/:id/rotation', protect, async (req, res) => {
  try {
    const farm = await FarmNew.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!farm) {
      return res.status(404).json({ message: 'Plot not found' });
    }

    const history = await CropRotation.findAll({
      where: { farmId: req.params.id },
      order: [['sowingDate', 'DESC']]
    });

    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching rotation history:', error);
    res.status(500).json({ message: 'Failed to retrieve rotation history.' });
  }
});

// 8. POST /api/farms/:id/rotation - Add a past season to rotation history manually
router.post('/:id/rotation', protect, [
  body('cropName').trim().notEmpty().withMessage('Crop Name is required'),
  body('season').trim().notEmpty().withMessage('Season is required'),
  body('sowingDate').isDate().withMessage('Sowing date must be a valid date'),
  body('harvestDate').isDate().withMessage('Harvest date must be a valid date'),
  body('yieldAmount').optional({ nullable: true }).isFloat().withMessage('Yield amount must be a number'),
  body('yieldUnit').optional({ nullable: true }).trim(),
  body('notes').optional({ nullable: true }).trim()
], validate, async (req, res) => {
  try {
    const farm = await FarmNew.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!farm) {
      return res.status(404).json({ message: 'Plot not found' });
    }

    const pastRecord = await CropRotation.create({
      farmId: req.params.id,
      ...req.body
    });

    res.status(201).json(pastRecord);
  } catch (error) {
    console.error('Error adding rotation record:', error);
    res.status(500).json({ message: 'Failed to add past season record.' });
  }
});

module.exports = router;
