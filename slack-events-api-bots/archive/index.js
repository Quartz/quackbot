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
    
    // slack links can arrive like this <http://nyc.gov> 
    // or this <http://nyc.gov|nyc.gov> ... so pulling out 
    // the core link in either case:
    const website = slackEvent.command.predicate.replace(/^</, '').replace(/>$/, '').replace(/\|.*$/, '');
    
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
            sendToSlack(slackEvent, `Saved ${website} to the internet archive!`);
        } else {
            console.log("Problem getting the wayback page: ", error);
            sendToSlack(slackEvent, "Hmmmm. That didn't work. Check the website URL and try again!");
        }
    });

};

// Helper functions can go here
