'use strict';

module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      address: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      acesso: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      aquisition: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      cxTxt: {
        allowNull: false,
        type: DataTypes.STRING(255),
      },
      cxB: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      cxC: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      cxE: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      aMin: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      aMax: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      isPumpConfigured:{
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      isPumpBlocked: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      isPumpConcerted: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('Users');
  }
};
