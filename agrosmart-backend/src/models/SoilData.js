const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SoilData = sequelize.define('SoilData', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  farmId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  nitrogen: {
    type: DataTypes.INTEGER, // Standardized as mg/kg or index
    allowNull: false,
    defaultValue: 40 // Default Medium
  },
  phosphorus: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 25
  },
  potassium: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 20
  },
  phLevel: {
    type: DataTypes.FLOAT,
    defaultValue: 6.5
  }
});

module.exports = SoilData;
