const sequelize = require('../config/database');
const User = require('./User');
const Farm = require('./Farm');
const Reminder = require('./Reminder');
const SoilData = require('./SoilData');
const CropRecord = require('./CropRecord');

// Associations
User.hasMany(Farm, { foreignKey: 'userId', onDelete: 'CASCADE' });
Farm.belongsTo(User, { foreignKey: 'userId' });

Farm.hasOne(SoilData, { foreignKey: 'farmId', onDelete: 'CASCADE' });
SoilData.belongsTo(Farm, { foreignKey: 'farmId' });

Farm.hasOne(CropRecord, { foreignKey: 'farmId', onDelete: 'CASCADE' });
CropRecord.belongsTo(Farm, { foreignKey: 'farmId' });

User.hasMany(Reminder, { foreignKey: 'userId', onDelete: 'CASCADE' });
Reminder.belongsTo(User, { foreignKey: 'userId' });

const db = {
  sequelize,
  User,
  Farm,
  Reminder,
  SoilData,
  CropRecord
};

module.exports = db;
