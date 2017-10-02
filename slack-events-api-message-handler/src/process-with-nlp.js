const request = require('request');

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
        const text_to_send = slackEvent.text.replace(/\|.*>/,'').replace(/<http/,'http').replace(/<\S*>[ $]?/,'').trim();
        
        const auth = "Bearer " + slackEvent.env.API_AI_TOKEN;
        
        request.post({
            headers: {
                'Authorization': auth,
                'Content-Type':'application/json; charset=utf-8'
            },
            url:'https://api.api.ai/v1/query?v=20150910',
            body:{
                "query": text_to_send,
                "timezone": "America/New_York",
                "lang": "en",
                "sessionId": slackEvent.user
            }
        }, function(error, response, body){
            
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
