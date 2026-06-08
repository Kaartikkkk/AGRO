const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Farm = sequelize.define('Farm', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  farmName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "My Farm"
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cityVillage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING, // Kept for legacy/combined display
    allowNull: true
  },
  acres: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  experienceYears: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  cropType: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Wheat"
  },
  soilType: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Alluvial"
  },
  irrigationType: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Well / Tube Well"
  },
  ownershipType: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Owned"
  },
  boundary: {
    type: DataTypes.GEOMETRY('POLYGON'),
    allowNull: true
  },
  season: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Kharif"
  },
  secondaryCrop: {
    type: DataTypes.STRING,
    allowNull: true
  },
  waterSource: {
    type: DataTypes.STRING,
    allowNull: true
  },
  soilTestAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  images: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = Farm;
