'use strict';
module.exports = (sequelize, DataTypes) => {
  var Team = sequelize.define('team', {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true
    },
    slack_id:    { 
      type: DataTypes.STRING,
      allowNull: false
    },
    verified:    { 
      type: DataTypes.BOOLEAN,
      default: false
    },
    verified_by: { type: DataTypes.INTEGER },
    verified_at: { type: DataTypes.TIME },
  }, { 
    define: { timestamps: true },
    underscored: true
  });
  
  Team.prototype.latestAuthorization = function() {
    return this.getAuthorizations({ 
      limit:1, 
      order:[["created_at","desc"]]
    });
  };
  
  return Team;
};
