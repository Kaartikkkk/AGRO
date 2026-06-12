const sequelize = require('../config/database');
const User = require('./User.model');
const Farm = require('./Farm.model');
const Reminder = require('./Reminder.model');
const SoilData = require('./SoilData.model');
const CropRecord = require('./CropRecord.model');
const FarmNew = require('./FarmNew.model');
const CropRotation = require('./CropRotation.model');
const DiseaseScan = require('./DiseaseScan.model');
const AIRecommendation = require('./AIRecommendation.model');
const ChatHistory = require('./ChatHistory.model');

// Associations (Legacy)
User.hasMany(Farm, { foreignKey: 'userId', onDelete: 'CASCADE' });
Farm.belongsTo(User, { foreignKey: 'userId' });

Farm.hasOne(SoilData, { foreignKey: 'farmId', onDelete: 'CASCADE' });
SoilData.belongsTo(Farm, { foreignKey: 'farmId' });

Farm.hasOne(CropRecord, { foreignKey: 'farmId', onDelete: 'CASCADE' });
CropRecord.belongsTo(Farm, { foreignKey: 'farmId' });

User.hasMany(Reminder, { foreignKey: 'userId', onDelete: 'CASCADE' });
Reminder.belongsTo(User, { foreignKey: 'userId' });

// Associations (New Land Management Module)
User.hasMany(FarmNew, { foreignKey: 'userId', onDelete: 'CASCADE' });
FarmNew.belongsTo(User, { foreignKey: 'userId' });

FarmNew.hasMany(CropRotation, { foreignKey: 'farmId', onDelete: 'CASCADE' });
CropRotation.belongsTo(FarmNew, { foreignKey: 'farmId' });

// Disease Detection Scan History
User.hasMany(DiseaseScan, { foreignKey: 'user_id', onDelete: 'CASCADE' });
DiseaseScan.belongsTo(User, { foreignKey: 'user_id' });

FarmNew.hasMany(DiseaseScan, { foreignKey: 'farm_id', onDelete: 'CASCADE' });
DiseaseScan.belongsTo(FarmNew, { foreignKey: 'farm_id' });

// AI Recommendations Associations
User.hasMany(AIRecommendation, { foreignKey: 'user_id', onDelete: 'CASCADE' });
AIRecommendation.belongsTo(User, { foreignKey: 'user_id' });

FarmNew.hasMany(AIRecommendation, { foreignKey: 'farm_id', onDelete: 'CASCADE' });
AIRecommendation.belongsTo(FarmNew, { foreignKey: 'farm_id' });

// Chat History Associations
User.hasMany(ChatHistory, { foreignKey: 'user_id', onDelete: 'CASCADE' });
ChatHistory.belongsTo(User, { foreignKey: 'user_id' });

FarmNew.hasMany(ChatHistory, { foreignKey: 'farm_id', onDelete: 'CASCADE' });
ChatHistory.belongsTo(FarmNew, { foreignKey: 'farm_id' });

const db = {
  sequelize,
  User,
  Farm,
  Reminder,
  SoilData,
  CropRecord,
  FarmNew,
  CropRotation,
  DiseaseScan,
  AIRecommendation,
  ChatHistory
};

module.exports = db;
