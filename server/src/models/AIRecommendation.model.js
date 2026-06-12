const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AIRecommendation = sequelize.define('AIRecommendation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  farm_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  recommendation_json: {
    type: DataTypes.JSON,
    allowNull: false
  },
  farm_context_snapshot: {
    type: DataTypes.JSON,
    allowNull: false
  },
  generated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  is_dismissed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  dismissed_indices: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: false
  },
  refresh_timestamps: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: false
  }
}, {
  tableName: 'ai_recommendations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = AIRecommendation;
