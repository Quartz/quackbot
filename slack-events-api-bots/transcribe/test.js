var app = require('./index.js');

var send_to_app = {
    command: {
        predicate: "https://url_to_a_mp3_file"
    }
};

app.handler(send_to_app, null, function(error, result){
    console.log(result);
});
