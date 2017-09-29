"use_strict";

const fs        = require('fs');
const path      = require('path');
const basename  = path.basename(module.filename);
const env       = process.env.NODE_ENV || 'development';
const config    = require(__dirname + '/../config/config.js')[env];

var TeamStore = function(Sequelize, options) {
  
  this.sequelize    = new Sequelize(options || config);
  var Team          = require(__dirname+'/team')(this.sequelize, Sequelize);
  var Authorization = require(__dirname+'/authorization')(this.sequelize, Sequelize);
  
  Team.hasMany(Authorization);
  Authorization.belongsTo(Team);
  
  this.Team          = Team;
  this.Authorization = Authorization;
  
  return this;
};

TeamStore.prototype.close = function(){
  return this.sequelize.sync().then(function() {
    console.log("handles before:", process._getActiveHandles().length);
    return this.sequelize.close().then(function() {
      console.log("handles after:", process._getActiveHandles().length);
    });
  });
};

module.exports = TeamStore;