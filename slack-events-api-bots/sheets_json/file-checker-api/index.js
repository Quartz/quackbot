// require modules here
var slack_test = require('./samples/slack_block.json');
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
        
        checkS3(incoming)
            // .then(buildSlackResponse)   
            .then( (results) => {
                console.log("Main code:", results);
                
                // decode the team id from the sessionId
                sendback.speech = "This is the result from the API! Congrats!";
                sendback.data.slack = slack_test;
                resolve(sendback);
            });
        
    });
    
};

async function checkS3(payload) {

    // the directory is the team identifier (TODO: Encrypt This)
    var directory = payload.sessionId.match(/^(.*)-/)[1];
    
    var params = {
        Bucket: s3_bucket,
        Prefix: directory + "/jsons/" 
    };
        
    let file_list = await listS3(params);
    
    if (!file_list || file_list.length < 2) {
        return "this will be the give me a URL statement list";
    }
    
    let file_promises = []
    
    // build a promise list to get all the urls
    for (i=0; file_list.length; i++) {
        
        // skip the directory key
        if (file_list[i] == `${directory}/jsons/`) continue;
        
        // turn 'T111111Z/jsons/My%20example%20spreadsheet.json'
        // into 'T111111Z/urls/My%20example%20spreadsheet.txt'
        var file_to_read = file_list[i].replace("/jsons/","/urls/").replace(/\.json$/, ".txt");
        
        var params = {
            Bucket: s3_bucket;
            Key: file_to_read;
        }
        
        /// STOPPED HERE ... NEED MORE S3 READ code
        
    }
    
    
    
    return file_list;
}

function listS3(params) {
    return new Promise((resolve, reject) => {
        s3.listObjectsV2(params, function (err, data) {
            if(err)throw err;
            resolve(data.Contents);
        }); 
    });
}

function readS3(params) {
    
    
}