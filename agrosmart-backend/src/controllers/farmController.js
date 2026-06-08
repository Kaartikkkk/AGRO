const { Farm, SoilData, CropRecord } = require('../models');

// Fetch all farms for the authenticated user
exports.getFarms = async (req, res) => {
  try {
    const farms = await Farm.findAll({ 
      where: { userId: req.user.id },
      include: [SoilData, CropRecord],
      order: [['createdAt', 'ASC']]
    });
    
    res.json(farms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new farm plot
exports.addFarm = async (req, res) => {
  const transaction = await Farm.sequelize.transaction();
  try {
    const { 
      farmName, location, cityVillage, state, acres, experienceYears, cropType, soilType,
      season, secondaryCrop, waterSource, irrigationType, ownershipType, soilTestAvailable, images, notes, boundary
    } = req.body;
    
    console.log(`📝 Registering new plot: ${farmName} for User: ${req.user.id}`);

    const farm = await Farm.create({
      userId: req.user.id,
      farmName: farmName || "New Land",
      location,
      cityVillage,
      state,
      acres,
      experienceYears,
      cropType,
      soilType,
      season,
      secondaryCrop,
      waterSource,
      irrigationType,
      ownershipType,
      soilTestAvailable,
      images,
      notes,
      boundary
    }, { transaction });

    // Initialize default soil and crop records
    await SoilData.create({ farmId: farm.id }, { transaction });
    await CropRecord.create({ farmId: farm.id }, { transaction });

    await transaction.commit();
    console.log(`✅ Plot registered successfully: ${farm.id}`);

    const fullFarm = await Farm.findByPk(farm.id, { include: [SoilData, CropRecord] });
    res.status(201).json(fullFarm);
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Plot Registration Failed:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Update a specific farm plot
exports.updateFarmData = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      farmName, location, cityVillage, state, acres, experienceYears, cropType, soilType,
      season, secondaryCrop, waterSource, irrigationType, ownershipType, soilTestAvailable, images, notes, boundary,
      nitrogen, phosphorus, potassium, phLevel, sowingDate, cropStage 
    } = req.body;
    
    let farm = await Farm.findOne({ where: { id, userId: req.user.id } });

    if (!farm) {
      return res.status(404).json({ message: 'Farm plot not found' });
    }

    await farm.update({
      farmName, location, cityVillage, state, acres, experienceYears, cropType, soilType,
      season, secondaryCrop, waterSource, irrigationType, ownershipType, soilTestAvailable, images, notes, boundary
    });

    // Update Soil Data
    if (nitrogen !== undefined || phosphorus !== undefined || potassium !== undefined || phLevel !== undefined) {
      await SoilData.upsert({
        farmId: farm.id, nitrogen, phosphorus, potassium, phLevel
      });
    }

    // Update Crop Record
    if (sowingDate !== undefined || cropStage !== undefined) {
      await CropRecord.upsert({
        farmId: farm.id, sowingDate, cropStage
      });
    }

    const updatedFarm = await Farm.findByPk(farm.id, { include: [SoilData, CropRecord] });
    res.json(updatedFarm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logic Engine for Fertilizer Recommendations
exports.getRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const { weather } = req.body; // Expecting current weather info (rainfall chance)

    const farm = await Farm.findOne({
      where: { id, userId: req.user.id },
      include: [SoilData, CropRecord]
    });

    if (!farm) return res.status(404).json({ message: 'Farm not found' });

    const soil = farm.SoilData || { nitrogen: 40, phosphorus: 25, potassium: 20 };
    const crop = farm.CropRecord || { cropStage: 'Vegetative' };
    
    let recommendation = {
      fertilizer: 'Balanced NPK 19:19:19',
      quantity: 50,
      unit: 'kg/Acre',
      timing: 'Morning (6:00 AM - 9:00 AM)',
      notes: 'General maintenance dose.'
    };

    // Rule-Based Logic
    if (soil.nitrogen < 30) {
      recommendation = {
        fertilizer: 'Urea (46% Nitrogen)',
        quantity: 45,
        unit: 'kg/Acre',
        timing: 'Split application (Early morning)',
        notes: 'Critical for vegetative growth. Ensure soil is moist.'
      };
    } else if (soil.phosphorus < 20) {
      recommendation = {
        fertilizer: 'DAP (Diammonium Phosphate)',
        quantity: 50,
        unit: 'kg/Acre',
        timing: 'Basal application',
        notes: 'Essential for root development and flowering.'
      };
    } else if (soil.potassium < 15) {
      recommendation = {
        fertilizer: 'MOP (Muriate of Potash)',
        quantity: 30,
        unit: 'kg/Acre',
        timing: 'Late evening',
        notes: 'Boosts immunity and drought resistance.'
      };
    }

    // Stage Adjustment
    if (crop.cropStage === 'Flowering') {
      recommendation.notes += ' High phosphorus focus recommended for this stage.';
    }

    // Weather Guard
    if (weather && weather.rainfall_chance > 60) {
      recommendation.status = 'DELAY';
      recommendation.precaution = 'High Rain Predicted! Delay application to prevent nutrient runoff.';
    } else {
      recommendation.status = 'OPTIMAL';
      recommendation.precaution = 'Safe to apply. No heavy rain expected.';
    }

    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a farm plot
exports.deleteFarm = async (req, res) => {
  try {
    const { id } = req.params;
    const farm = await Farm.findOne({ where: { id, userId: req.user.id } });

    if (!farm) return res.status(404).json({ message: 'Farm not found' });

    await farm.destroy();
    res.json({ message: 'Farm removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
