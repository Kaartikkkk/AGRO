const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FarmNew = sequelize.define('FarmNew', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  plotName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  size: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  sizeUnit: {
    type: DataTypes.ENUM('acres', 'bigha', 'hectare'),
    allowNull: false
  },
  landType: {
    type: DataTypes.ENUM('irrigated', 'rain-fed', 'mixed'),
    allowNull: false
  },
  ownership: {
    type: DataTypes.ENUM('owned', 'leased', 'shared'),
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  village: {
    type: DataTypes.STRING,
    allowNull: false
  },
  district: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  currentCrop: {
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
  previousCrop: {
    type: DataTypes.STRING,
    allowNull: true
  },
  irrigationSource: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'FarmsNew'
});

module.exports = FarmNew;
