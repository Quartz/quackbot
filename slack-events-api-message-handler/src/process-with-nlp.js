const request = require('request');

// This function requires the original event since replying in the same channel
// is the only supported flow.
function processWithNLP(slackEvent) {
    return new Promise ((resolve, reject) => {
        
        console.log("Sending to Dialogflow for processing: \n", slackEvent);
        
        // slack links can arrive like this <http://nyc.gov> 
        // or this <http://nyc.gov|nyc.gov> ... so pulling out 
        // the core link in either case.
        // also remove users and channels <@UABC123555>
        // even at the end of a line
        // and trim
        const text_to_send = slackEvent.text.replace(/\|.*>/,'').replace(/<http(\S*)>/,'http$1').replace(/<@\S*>[ $]?/,'').trim();
            
        const content = {
            "query": text_to_send,
            "timezone": "America/New_York",
            "lang": "en",
            "sessionId": slackEvent.team_id + "-" + slackEvent.user
        };  
        
        request.post({
            url: 'https://api.api.ai/v1/query?v=20150910',
            headers: {
                "Authorization": "Bearer " + slackEvent.env.API_AI_TOKEN
            },
            body: content,
            json: true
        }, function(error, response, body){
            if (error) {
                reject(null);
                console.log(error);
                return;
            }
              
            console.log("API.AI returned: \n", response);
            resolve(body.result);
            return;
        });
        
    });
}

module.exports = processWithNLP;
