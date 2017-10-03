var app = require('./index.js');

var url = "https://www.washingtonpost.com/news/opinions/wp/2014/02/27/the-outlook-list-of-things-we-do-not-say/?utm_term=.4a9cb67c9bef";

var lambda_blob = {};
lambda_blob.command = {};
lambda_blob.command.predicate = url;

app.handler(lambda_blob, null, function(error, result){
    // console.log(result);
});