const request = require('request');
const sendToSlack = require('./src/slack-send-message');

// Include global variables here (if any)

exports.handler = function(slackEvent, context, callback){ 

    // funtional code goes here ... with the 'event' and 'context' coming from
    // whatever calls the lambda function (like CloudWatch or Alexa function).
    // callback function goes back to the caller.
    
    if (!slackEvent.command.predicate) {
        sendToSlack(slackEvent, "Oh, you have to specify a web page. Try `archive example.com`");
        callback(null);
        return;
    }
    
    const website = slackEvent.command.predicate;
    
    const requestUrl = `https://web.archive.org/save/${website}`;
    // 
    // // Send message.
    // request.get(requestUrl)
    // .on('response', (res) => {
    //     console.log (`Got back: \n${res.statusCode}`);
    //     return;
    // })
    // .on('error', (err) => {
    //     console.log (`ERROR: responded, but got: \n ${err.message}`);
    //     return;
    // });    

    request(requestUrl, function (error, response) {
        if (response.statusCode == 200) {
            console.log("Successfully saved wayback page");
            sendToSlack(slackEvent, `Done! Saved ${website} to the internet archive.`);
        } else {
            console.log("Problem getting the wayback page: ", error, response);
            sendToSlack(slackEvent, "Hmmmm. That didn't work. Sometimes you just need to try again. Also be sure the URL is a good one.");
        }
    });

};

// Helper functions can go here
