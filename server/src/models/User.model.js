const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tier: {
    type: DataTypes.STRING,
    defaultValue: "Golden Tier"
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  home_city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  home_state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  home_district: {
    type: DataTypes.STRING,
    allowNull: true
  },
  home_pincode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  home_latitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  home_longitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  location_source: {
    type: DataTypes.ENUM('gps', 'manual'),
    defaultValue: 'manual',
    allowNull: false
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.validPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
