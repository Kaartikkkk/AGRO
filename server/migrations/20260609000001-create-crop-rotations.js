'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CropRotations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      farmId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'FarmsNew',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cropName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      season: {
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
      yieldAmount: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      yieldUnit: {
        type: Sequelize.STRING,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.dropTable('CropRotations');
  }
};
