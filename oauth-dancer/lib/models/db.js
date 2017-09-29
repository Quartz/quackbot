"use_strict";

const fs        = require('fs');
const path      = require('path');
const basename  = path.basename(module.filename);
const env       = process.env.NODE_ENV || 'development';
const config    = require(__dirname + '/../config/config.js')[env];

module.exports = function(Sequelize){
  var sequelize = new Sequelize(config);
  //sequelize.authenticate().then(
  //  (win)  => { console.log("Connected to Database"); }, 
  //  (fail) => { console.log("Unable to connect to database!"); console.log(fail); 
  //});

  var db           = {};
  db.sequelize     = sequelize;
  db.team          = require(__dirname+'/team')(sequelize, Sequelize);
  db.authorization = require(__dirname+'/authorization')(sequelize, Sequelize);
  
  return db;
};

