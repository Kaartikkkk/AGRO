'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ai_recommendations', {
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
        onDelete: 'CASCADE'
      },
      recommendation_json: {
        type: Sequelize.JSON,
        allowNull: false
      },
      farm_context_snapshot: {
        type: Sequelize.JSON,
        allowNull: false
      },
      generated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      is_dismissed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      dismissed_indices: {
        type: Sequelize.JSON,
        defaultValue: '[]',
        allowNull: false
      },
      refresh_timestamps: {
        type: Sequelize.JSON,
        defaultValue: '[]',
        allowNull: false
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
    await queryInterface.dropTable('ai_recommendations');
  }
};
