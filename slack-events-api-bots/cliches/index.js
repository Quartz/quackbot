var csv = require('fast-csv');
var fs = require('fs');
var request = require('request');
var unfluff = require('unfluff');
var sendToSlack = require('./src/slack-send-message');

var cliche_list;

exports.handler = function(event, context, callback){
    
    cliche_list = [];
    
    var url = event.command.predicate;
    // url validation done upstream
    
    request(url, function (request_error, response, body) {
        
        if (request_error) {
            console.log('error:', request_error); // Print the error if one occurred 
            callback(request_error);
            return;
        }
        
        var page = unfluff(body);
        console.log(page.text);    
        
        var allPromise = Promise.all([
            checkDataFile('681cliches', page),
            checkDataFile('wapo', page),
            checkDataFile('prowritingaid', page),
            checkDataFile('quartz', page)
        ]);
        allPromise.then(function(){
            // console.log("all checked");
            var reply = replyWith(cliche_list);
            console.log(reply);
            sendToSlack(event, reply);
            callback(null, {} );
        })
        .catch(function(promise_err){
            console.log(promise_err);
            callback(promise_err);
        });
        
    });
    
};
 
function checkDataFile(file, page){
    return new Promise(function (resolve, reject) {
        
        var stream = fs.createReadStream("data/" + file + ".tsv");

        // set up listeners for every line in the CSV stream
        // assumes no headers in CSV
        csv
            .fromStream(stream, {delimiter: '\t'})
            .on("data", function(data){
                
                // data is an array, just need the first element data[0]
                // make a regular expression match out of the csv row
                var phrase = data[0].trim();
                var pattern = new RegExp(phrase + "[ .?;:)!,-]", 'gi');
                var matches = page.text.match(pattern);
                
                // if we have a match cliche and haven't found it
                // using another list already
                if (matches && cliche_list.indexOf(matches[0]) == -1 ) {
                    
                    // add the match string to the global list of cliches so far
                    cliche_list.push(matches[0]);
                    console.log("matched ", matches[0], " in ", file);
                    
                }   
                         
            })
            .on("end", function(){
                // console.log(file + " done");
                return resolve();
            })
            .on("error", function(error){
                return reject(error);
            });
    });
}

function replyWith(the_list) {
    var message = {};
    var total_cliches = the_list.length;
    
    message.text = "I found " + total_cliches + " cliches in the web page you gave me.\n";
    
    if (total_cliches > 1) {
        message.text += "They are:\n";
        
        message.attachments = [{}];
        message.attachments[0].text = "";
        
        for (var i = 0; i < total_cliches; i++) {
                    
            message.attachments[0].text += the_list[i] + "\n";
            
        }
    
    }

    if (the_list.length == 1) {
        message.text += "It's \"" + the_list[0] + ".\"";
    }

    return message;
    
}
   
