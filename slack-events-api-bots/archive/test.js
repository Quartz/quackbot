var app = require('./index.js');

var send_to_app = {
    command: {
        predicate: "<http://nyc.gov>"
    }
};

app.handler(send_to_app, null, function(error, result){
    console.log(result);
});
