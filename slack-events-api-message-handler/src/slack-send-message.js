const request = require('request-json');


// This function requires the original event since replying in the same channel
// is the only supported flow.
function sendToSlack(slackEvent, optional_message) {
    return new Promise ((resolve, reject) => {
        
        const slackMessage = {
            channel: slackEvent.channel
        };
        
        console.log("Handling this event for sending back:", JSON.stringify(slackEvent));

        // no optional message and no general nlp info
        if(!optional_message && !slackEvent.hasOwnProperty("nlp")) {
            console.log("I see no optional message and no nlp object.")
            reject('OK: nothing to say')
            return
        }
        
        // no optional message and no specific nlp info
        if (!optional_message && !slackEvent.nlp.fulfillment.hasOwnProperty("data") && !slackEvent.nlp.fulfillment.speech) {
            console.log("I see no optional message and no nlp info I can use.")
            reject('OK: nothing to say')
            return
        }
                
        if (optional_message) {
            // just use this message without further ado
            slackMessage.text = optional_message;
            
        } else {
            // no optional message, so looking for a slack block to send as attachment
            // otherwise send the fulfillment speech
                        
            if ( !slackEvent.nlp.fulfillment.hasOwnProperty("data") ) {  
                  
                slackMessage.text = slackEvent.nlp.fulfillment.speech
            
            } else {
                    
                slackMessage.attachments = slackEvent.nlp.fulfillment.data.slack
                
            }
                
        }

        console.log("Prepared to send this to slack: ", JSON.stringify(slackMessage));

        // Send message.
        var client = request.createClient('https://slack.com/');
        client.headers['Authorization'] = `Bearer ${slackEvent.authorization.bot_access_token}`;
        client.post('api/chat.postMessage', slackMessage, function(err, res, body) {
            return console.log(`Slack says:${res.statusCode} -- ${JSON.stringify(body)}`);
        })
                  
    }).catch( (err) => {
        console.log(`Got an error in the send-to-Slack code: ${err}`)
        return;
    })

}

module.exports = sendToSlack;

