const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CropRotation = sequelize.define('CropRotation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  farmId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  cropName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  season: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sowingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  harvestDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  yieldAmount: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  yieldUnit: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'CropRotations'
});

module.exports = CropRotation;
