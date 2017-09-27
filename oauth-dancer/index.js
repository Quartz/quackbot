var request   = require('request-promise-native');
var Sequelize = require('sequelize');
var db        = require('../lib/slack/models/db')(Sequelize);

exports.handler = (event, context, callback) => {
  console.log("\nENV: \n" + JSON.stringify(process.env) + "\n\n");
  console.log("\nEvent: \n" + JSON.stringify(event) + "\n\n");
  console.log("\nContext: \n" + JSON.stringify(context) + "\n\n");

  var code = event.queryStringParameters.code;
  var promises = [promiseToGetAuthorizationToken(code), promiseToSaveAuthorization];
  Promise.all(promises).then(
    promiseToRespond,
    handleError
  );
  
  callback(null, { body: "Hi! From the API." });
};

var promiseToGetAuthorizationToken = function(code, options={}){
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

var promiseToSaveAuthorization = function(response){
  // console.log(response);
  
  var findTeam = db.team.findOrCreate({ where: { slack_id: response.team_id } });
  
  // save authorization
  var createAuthorization = new Promise((resolve, reject) => {
    var [team, created] = resolve;
    return db.authorization.create({ details: response });
  });
  
  return Promise.all([teamPromise, createAuthorization]);
};

var handleSlackError = function(failure){
  console.log("Encountered an Error");
  console.log(failure);
};
