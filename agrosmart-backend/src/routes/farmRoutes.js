const express = require('express');
const farmController = require('../controllers/farmController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// General farm plot management
router.route('/')
  .get(protect, farmController.getFarms)
  .post(protect, farmController.addFarm);

// Specific farm plot actions (Update/Delete)
router.route('/:id')
  .put(protect, farmController.updateFarmData)
  .delete(protect, farmController.deleteFarm);

// Fertilizer Recommendation Logic
router.route('/:id/recommendation')
  .post(protect, farmController.getRecommendation);

module.exports = router;
