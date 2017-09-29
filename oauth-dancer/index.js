var request   = require('request-promise');
var Sequelize = require('sequelize');
var db        = require('./lib/models/db')(Sequelize);

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
  return db.team.findOrCreate({ where: { slack_id: response.team_id } }).spread(
    (team, created) => { return db.authorization.create({ details: response }); }
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
  
  var code = event.queryStringParameters.code;
  
  promiseToGetAuthorizationToken(code)
  .then(promiseToSaveAuthorization)
  .then(promiseToCloseConnections
  ).then(success, handleError);
};
