const sequelize = require('../config/database');
const User = require('./User.model');
const Farm = require('./Farm.model');
const Reminder = require('./Reminder.model');
const SoilData = require('./SoilData.model');
const CropRecord = require('./CropRecord.model');
const FarmNew = require('./FarmNew.model');
const CropRotation = require('./CropRotation.model');

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

const db = {
  sequelize,
  User,
  Farm,
  Reminder,
  SoilData,
  CropRecord,
  FarmNew,
  CropRotation
};

module.exports = db;
