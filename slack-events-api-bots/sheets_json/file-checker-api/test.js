var app = require('./index.js');

var send_to_app = "hello!";

app(send_to_app, null, function(error, result){
    console.log(result);
});

