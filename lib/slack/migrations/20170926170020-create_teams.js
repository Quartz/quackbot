'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('teams', { 
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      slack_id: {
        type: Sequelize.STRING,
      },
      verified: { 
        type: Sequelize.BOOLEAN,
        default: false
      },
      verified_by: Sequelize.INTEGER,
      verified_at: Sequelize.DATE,
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },


  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('teams');
  }
};
