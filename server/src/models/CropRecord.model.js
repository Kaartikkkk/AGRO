const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CropRecord = sequelize.define('CropRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  farmId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  sowingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  cropStage: {
    type: DataTypes.ENUM('Sowing', 'Seedling', 'Vegetative', 'Flowering', 'Maturity', 'Harvesting'),
    allowNull: false,
    defaultValue: 'Seedling'
  }
});

module.exports = CropRecord;
