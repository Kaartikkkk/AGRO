'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('DiseaseScans', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      farm_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'FarmsNew',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      image_filename: {
        type: Sequelize.STRING,
        allowNull: false
      },
      crop_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      disease_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      confidence: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      severity: {
        type: Sequelize.ENUM('High', 'Medium', 'Low'),
        allowNull: false
      },
      is_healthy: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      symptoms_text: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      treatment_json: {
        type: Sequelize.JSON,
        allowNull: false
      },
      top_3_json: {
        type: Sequelize.JSON,
        allowNull: false
      },
      grad_cam_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      scan_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('DiseaseScans');
  }
};
