var request   = require('request-promise');
var Sequelize = require('sequelize');
var TeamStore = require('./lib/models/db');
var crypto    = require('crypto');

// Ask Slack to provide tokens for us to store and use later.
var promiseToGetAuthorizationToken = function(code, options={}){
  console.log("Starting Request...");
  return request({
    url: 'https://slack.com/api/oauth.access',
    method: 'POST',
    form: {
      client_id: (options.client_id || process.env.CLIENT_ID),
      client_secret: (options.client_secret || process.env.CLIENT_SECRET),
      code: code
    }
  });
};

var promiseToSaveAuthorization = function(responseString){
  console.log("Received Request...");
  var response = JSON.parse(responseString);
  console.log(JSON.stringify(response));
  
  console.log("Looking up Team by slack_id: " + response.team_id);
  return db.Team.findOrCreate({ where: { slack_id: response.team_id } }).spread(
    (team, created) => { return db.Authorization.create({ team_id: team.id, details: response }); }
  );
};

// Sequelize needs to be instructed to close db connections
// so that Lambda can exit gracefully
var promiseToCloseConnections = function(){
  db.sequelize.sync().then(function() {
    console.log("handles before:", process._getActiveHandles().length);
    return db.sequelize.close().then(function() {
      console.log("handles after:", process._getActiveHandles().length);
    });
  });
};

var decodeState = function(stateString) {
  var decode = function(ciphertext, ivString){

    var algorithm = "aes-256-cbc";
    var iv        = new Buffer(ivString, 'base64');
    var key       = new Buffer(keyString, 'base64');
    var msgBuffer = new Buffer(ciphertext, 'base64');
  
    var decipher = crypto.createDecipheriv(algorithm, key, iv);
    return decipher.update(ciphertext, 'base64', 'utf8') + decipher.final();
  };
  
  keyString = process.env.CIPHER_KEY;
  
  if (keyString) {
    var inputSplit = stateString.split("--");
    var msgStr = inputSplit[0];
    var ivStr = inputSplit[1];
    
    var details = null;
    try {
      jsonStr = decode(msgStr, ivStr);
      details = JSON.parse(jsonStr);
    } catch(e) {
      console.log("Caught an error!");
      console.log(e);
    }
    return details;
  }
};

exports.handler = (event, context, callback) => {
  //console.log("\nENV: \n" + JSON.stringify(process.env) + "\n\n");
  console.log("\nEvent: \n" + JSON.stringify(event) + "\n\n");
  //console.log("\nContext: \n" + JSON.stringify(context) + "\n\n");
  
  var success = function(){
    console.log("Declaring Success");
    callback(null, {
      statusCode: 200,
      body: "Hi! You've added Quackbot to your team!",
      isBase64Encoded: false
    });
  };
  
  var handleError = (failure) => {
    console.log("Encountered an Error");
    console.log(failure);
    callback(new Error('internal server error'));
  };
  
  var promiseToNotifyAdmin = function(authorization){
    var hook = process.env.ADMIN_WEBHOOK;
    if (hook) {
      var userInfo = state ? `${state.email} (from ${state.slug})` : "Someone i couldn't identify";    
    
      return request({
        url: hook,
        method: 'POST',
        json: {
          text: `${userInfo} just added me to ${authorization.details.team_name} (${authorization.details.team_id})!`
        }
      });
    }
  };
  
  var code = event.queryStringParameters.code;
  var state = decodeState(event.queryStringParameters.state);
  console.log("STATE IS: " + JSON.stringify(state));
  
  db = new TeamStore(Sequelize);
  
  promiseToGetAuthorizationToken(code)
  .then(promiseToSaveAuthorization)
  .then(promiseToNotifyAdmin)
  .then(promiseToCloseConnections)
  .then(success, handleError);
};
