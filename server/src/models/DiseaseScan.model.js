const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DiseaseScan = sequelize.define('DiseaseScan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  farm_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'FarmsNew',
      key: 'id'
    }
  },
  image_filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  crop_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  disease_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('High', 'Medium', 'Low'),
    allowNull: false
  },
  is_healthy: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  symptoms_text: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  treatment_json: {
    type: DataTypes.JSON,
    allowNull: false
  },
  top_3_json: {
    type: DataTypes.JSON,
    allowNull: false
  },
  grad_cam_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  scan_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'DiseaseScans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = DiseaseScan;
