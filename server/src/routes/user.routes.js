const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { User, FarmNew } = require('../models');

const router = express.Router();

// 1. GET /api/user/profile - Get user details and all associated farms
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: FarmNew,
        order: [['createdAt', 'DESC']]
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user.id,
      name: user.fullName,
      email: user.email,
      phone: user.phoneNumber,
      home_city: user.home_city,
      home_state: user.home_state,
      home_district: user.home_district,
      home_pincode: user.home_pincode,
      home_latitude: user.home_latitude,
      home_longitude: user.home_longitude,
      location_source: user.location_source,
      farms: (user.FarmNews || []).map(f => ({
        id: f.id,
        plot_name: f.plotName,
        city: f.city || f.village || '',
        state: f.state,
        district: f.district,
        pincode: f.pincode,
        latitude: f.latitude,
        longitude: f.longitude,
        current_crop: f.currentCrop
      }))
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to retrieve profile data.' });
  }
});

// 2. PUT /api/user/home-location - Update user home location details only
router.put('/home-location', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { city, state, district, pincode, latitude, longitude, source } = req.body;

    user.home_city = city || null;
    user.home_state = state || null;
    user.home_district = district || null;
    user.home_pincode = pincode || null;
    user.home_latitude = latitude !== undefined && latitude !== null ? parseFloat(latitude) : null;
    user.home_longitude = longitude !== undefined && longitude !== null ? parseFloat(longitude) : null;
    user.location_source = source || 'manual';

    await user.save();

    res.status(200).json({
      id: user.id,
      name: user.fullName,
      email: user.email,
      phone: user.phoneNumber,
      home_city: user.home_city,
      home_state: user.home_state,
      home_district: user.home_district,
      home_pincode: user.home_pincode,
      home_latitude: user.home_latitude,
      home_longitude: user.home_longitude,
      location_source: user.location_source
    });
  } catch (error) {
    console.error('Error updating home location:', error);
    res.status(500).json({ message: 'Failed to update home location.' });
  }
});

module.exports = router;
