var app = require('./index.js');
var sample = require('./samples/webhook_from_dialogflow.json');

var send_to_app = sample;

app(send_to_app, null, function(error, result){
    console.log("Test function got:", result);
});

