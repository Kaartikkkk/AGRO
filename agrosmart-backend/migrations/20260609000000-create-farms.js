'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('FarmsNew', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      plotName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      size: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      sizeUnit: {
        type: Sequelize.ENUM('acres', 'bigha', 'hectare'),
        allowNull: false
      },
      landType: {
        type: Sequelize.ENUM('irrigated', 'rain-fed', 'mixed'),
        allowNull: false
      },
      ownership: {
        type: Sequelize.ENUM('owned', 'leased', 'shared'),
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      village: {
        type: Sequelize.STRING,
        allowNull: false
      },
      district: {
        type: Sequelize.STRING,
        allowNull: false
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pincode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      latitude: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      longitude: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      currentCrop: {
        type: Sequelize.STRING,
        allowNull: false
      },
      sowingDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      harvestDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      previousCrop: {
        type: Sequelize.STRING,
        allowNull: true
      },
      irrigationSource: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('FarmsNew');
  }
};
