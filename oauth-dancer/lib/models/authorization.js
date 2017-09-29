'use strict';
module.exports = (sequelize, DataTypes) => {
  var Authorization = sequelize.define('authorization', {
    id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    team_id:    { type: DataTypes.INTEGER },
    details:    { type: DataTypes.JSONB },
  }, { 
    define: { timestamps: true },
    underscored: true
  });
  return Authorization;
};
