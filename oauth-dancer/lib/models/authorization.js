'use strict';
module.exports = (sequelize, DataTypes) => {
  var Authorization = sequelize.define('authorization', {
    id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    details:    { type: DataTypes.JSONB },
  }, { 
    define: { timestamps: true }
  });
  return Authorization;
};
