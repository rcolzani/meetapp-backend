'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('meetups', 'banner_id'),
      queryInterface.removeColumn('meetups', 'organizer_id'),
      queryInterface.addColumn('meetups', 'file_id', {
        type: Sequelize.INTEGER,
        references: { model: 'files', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
      }),
      queryInterface.addColumn('meetups', 'user_id', {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
      }),
    ]);

  },
};
