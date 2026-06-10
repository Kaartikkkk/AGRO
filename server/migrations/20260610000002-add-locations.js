'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add columns to Users table
    await queryInterface.addColumn('Users', 'home_city', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'home_state', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'home_district', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'home_pincode', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'home_latitude', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'home_longitude', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
    
    try {
      await queryInterface.sequelize.query("CREATE TYPE enum_users_location_source AS ENUM ('gps', 'manual');");
    } catch (e) {
      // type might already exist
    }
    
    await queryInterface.addColumn('Users', 'location_source', {
      type: Sequelize.ENUM('gps', 'manual'),
      defaultValue: 'manual',
      allowNull: false
    });

    // Add column to FarmsNew table
    await queryInterface.addColumn('FarmsNew', 'city', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'home_city');
    await queryInterface.removeColumn('Users', 'home_state');
    await queryInterface.removeColumn('Users', 'home_district');
    await queryInterface.removeColumn('Users', 'home_pincode');
    await queryInterface.removeColumn('Users', 'home_latitude');
    await queryInterface.removeColumn('Users', 'home_longitude');
    await queryInterface.removeColumn('Users', 'location_source');
    
    await queryInterface.removeColumn('FarmsNew', 'city');
    
    try {
      await queryInterface.sequelize.query("DROP TYPE enum_users_location_source;");
    } catch (e) {
      // ignore
    }
  }
};
