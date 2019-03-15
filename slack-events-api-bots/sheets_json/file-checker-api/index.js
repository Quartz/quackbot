// require modules here
const AWS = require('aws-sdk');
AWS.config.apiVersions = {
    s3: '2006-03-01'
};

var s3 = new AWS.S3();
var s3_bucket = "quack-gsheet-jsons";

// var bucket = process.ENV.S3_BUCKET;

module.exports = function(incoming) {
    
    // incoming is from dialogflow api V1  TODO: Upgrade to V2
    // see: https://dialogflow.com/docs/fulfillment/how-it-works
  
    //// TEMPORARY DEV THING. 
    // Setting sessin id here to test from Dialogflow. Delete this in production.
    incoming.sessionId = "T111111Z-U222222W";
  
    // establish a blank return object
    var sendback = {
        "speech": "",
        "displayText": "",
        "data": {
            "slack": {}
        },
        "contextOut": [],
        "source": "Quackbot File-Checker API",
        "followupEvent": {}
    };
        
    return new Promise(function(resolve, reject){
        
        mainFunction(incoming)
            // .then(buildSlackResponse)   
            .then( (results) => {
                console.log("Main code:", JSON.stringify(results));
                
                // decode the team id from the sessionId
                sendback.speech = "This is the result from the API! Congrats!";
                sendback.data.slack = results;
                resolve(sendback);
            })
            .catch( (err) => {
                console.log("I caught a main function error:", err);
                reject(err);
            });
        
    });
    
};

async function mainFunction(payload) {

    console.log("ID:", payload.sessionId);

    // the directory is the team identifier (TODO: Encrypt This)
    var directory = payload.sessionId.match(/^(.*)-/)[1];
    
    var params = {
        Bucket: s3_bucket,
        Prefix: directory + "/jsons/" 
    };
        
    let file_list = await listS3(params);
    let all_the_links = await getAllTheFiles(file_list);
    let slack_response = await buildSlackResponse(all_the_links);

    return slack_response;
}

function listS3(params) {
    return new Promise((resolve, reject) => {
        s3.listObjectsV2(params, function (err, data) {
            if(err)throw err;
            resolve(data.Contents);
        }); 
    });
}



async function getAllTheFiles(file_list) {
    
    // return null if there are no files to list
    if (!file_list || file_list.length < 2) {
        return null;
    }
    
    let file_promises = [];
    
    // build a promise list to get all the urls
    for (var i=0; i < file_list.length; i++) {
        
        // skip the directory key 'T111111Z/jsons/'
        if (file_list[i].Size == 0) continue;
        
        // turn 'T111111Z/jsons/My%20example%20spreadsheet.json'
        // into 'T111111Z/urls/My%20example%20spreadsheet.txt'
        var file_to_read = file_list[i].Key.replace("/jsons/","/urls/").replace(/\.json$/, ".txt");
        
        var params = {
            Bucket: s3_bucket,
            Key: file_to_read
        };
        
        file_promises.push(readS3(params));
        
    }

    let results = await Promise.all(file_promises);
    return results;
    
}

function readS3(params) {
    
    return new Promise ((resolve, reject) => {
        
        // read the URL off S3 and return:
        // {
        //    "name": url-decoded sheet name,
        //    "sheet_url": string of the spreadsheet URL
        // }
        
        // extract the clean file name from the whole, url-encoded one
        var file_name = decodeURI(params.Key).match(/.*\/urls\/(.*).txt/)[1];
        
        var file_object = {
            "name": file_name
        };
        
        s3.getObject(params, (err, data) => {

            try {
                file_object.sheet_url = data.Body.toString('utf-8');              
                resolve(file_object);
                return;
            } catch (err) {
                console.log("Error getting S3 file:", params.Key, err);
                reject(err);
                return;
            }
        });
        
    });
    
    
}

function buildSlackResponse(file_links) {
    
    // establish a blank slack block object
    var slack_back = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "Looks like you have existing JSON files I could update for you. Cool!"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "To *update* an existing file, pick one from the list here ..."
            },
            "accessory": {
                "action_id": "quackbot-gsheet-to-json",
                "type": "static_select",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Pick a file ...",
                    "emoji": true
                },
                "options": []
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "To make a *new* JSON file ... \n1. Share the new Google spreadsheet with quackbot-tbd@gmail.com\n2. Give me the sharing link for that new spreadsheet. "
            }
        }
    ];
    
    // just return the last instruction if there are no file links
    if (!file_links) {
        return slack_back[2];
    }
    
    var option_list = [];
    
    // build the options list
    file_links.forEach( (file) => {
        
        option_list.push(
            {
                "text": {
                    "type": "plain_text",
                    "text": file.name,
                    "emoji": true
                },
                "value": file.sheet_url
            }
        );
        
    });
    
    // insert the options list into the blank slack_back object
    // where it goes (which, for us, is inside the second element in the array)

    slack_back[1].accessory.options = option_list;
    return slack_back;
    
    
}