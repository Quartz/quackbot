var app = require('./index.js');

var send_to_app = {
    command: {
        verb: "pdf",
        predicate: "agriculture"
    }
};


app.handler(send_to_app, null, function(error, result){
    console.log(JSON.stringify(result));
});
