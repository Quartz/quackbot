// require modules here

// var bucket = process.ENV.S3_BUCKET;

module.exports = function(incoming) {
    
    // incoming is from dialogflow api V1  TODO: Upgrade to V2
    // see: https://dialogflow.com/docs/fulfillment/how-it-works
  
    // establish a blank return object
    var sendback = {
        "speech": "",
        "displayText": "",
        "data": {
            "slack": {}
        },
        "contextOut": [],
        "source": "Quackbot File-Checker API",
        "followupEvent": {}
    };
  
    return new Promise(function(resolve, reject){
        
        // decode the team id from the sessionId
        sendback.speech = "This is the result from the API! Congrats!";
        resolve(sendback);
        
    });
    
};