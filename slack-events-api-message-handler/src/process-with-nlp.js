const request = require('request');
const qs = require('querystring');

// This function requires the original event since replying in the same channel
// is the only supported flow.
function processWithNLP(slackEvent) {
    return new Promise ((resolve, reject) => {
        
        console.log("Sending to API.ai for processing: \n", slackEvent);
        
        // slack links can arrive like this <http://nyc.gov> 
        // or this <http://nyc.gov|nyc.gov> ... so pulling out 
        // the core link in either case.
        // also remove users and channels <@UABC123555>
        // even at the end of a line
        // and trim
        const text_to_send = slackEvent.message.text.replace(/\|.*>/,'').replace(/<http/,'http').replace(/<\S*>[ $]?/,'').trim();
            
        const query = qs.stringify({
            "query": text_to_send,
            "timezone": "America/New_York",
            "lang": "en",
            "sessionId": slackEvent.message.user
        });  
                
        const options = {
            url:'https://api.api.ai/v1/query?v=20150910',
            method: 'GET',
            auth: {
                bearer: slackEvent.env.API_AI_TOKEN
            },
            qs: query

        };
        
        request(options, function(error, response, body){
            
            if (error) {
                reject(null);
                return;
            }
            
            resolve(body.result);
            return;
        });
    });
}

module.exports = processWithNLP;
