var request = require('request-promise-native');

exports.handler = (event, context, callback) => {
  console.log("\nENV: \n" + JSON.stringify(process.env) + "\n\n");
  console.log("\nEvent: \n" + JSON.stringify(event) + "\n\n");
  console.log("\nContext: \n" + JSON.stringify(context) + "\n\n");

  var code = event.queryStringParameters.code;
  promiseToGetAuthorizationToken(code).then(
    promiseToSaveAuthorization, 
    handleSlackError
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

var handleSlackError = function(failure){
  console.log("BOO");
  console.log(failure);
};

var promiseToSaveAuthorization = function(response){
  console.log("YAY");
  console.log(response);
};

/*

authorizations:
  created_at, DateTime
  details, JSONB
  verified, Boolean
  verified_by, Integer
  verified_at, DateTime
*/