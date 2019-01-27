// Require modules here

// Include global variables here (if any)

exports.handler = function(event, context, callback){ 

    // funtional code goes here ... with the 'event' and 'context' coming from
    // whatever calls the lambda function (like CloudWatch or Alexa function).
    // callback function goes back to the caller.
    
    var send_back = "I got '" + event + "' from you!";
    
    // format is callback(error, response);
    callback(null, send_back);

};

// Helper functions can go here

