var Tabletop = require('tabletop');
var fuzz = require('fuzzball');
var sendToSlack = require('./src/slack-send-message');

// The Google spreadsheet must be "Published" -- which is NOT the same as
// sharing it publicly! (For reals.) Go to the spreadsheet then:
//    File > Publish to the Web ...
// Use the URL you get once you've published it.
var spreadsheet_published_url = "https://docs.google.com/spreadsheets/d/1hU7Snj4KZ-ppyy388l-sV4I26n4yGVb8xYnygPOS-5k/pub?gid=0&single=true&output=html";

// the name of the sheet in a mult-sheet spreadsheet
var sheet_name = "Data";

// these named columns will be searched for a match
var columns_to_search = ['Keywords', 'Product', 'Source', 'Topic'];

// number of rows to slack back as examples
var num_rows_to_send_back = 3;

exports.handler = function(event, context, callback){ 

    // funtional code goes here ... with the 'event' and 'context' coming from
    // whatever calls the lambda function (like CloudWatch or Alexa function).
    // callback function goes back to the caller.
    
    // our quack bot sends the info in command.predicate
    var query = event.command.predicate;

    // On it!
    sendToSlack(event, `One sec while I check my list of excellent data sets for "${query}" ...`);

    getSpreadsheetData(spreadsheet_published_url, sheet_name)
    .then((sheet_data) => {
        searchSheet(query, sheet_data, columns_to_search)
        .then(makeSlackMessage)
        .then((message) => {
            sendToSlack(event, message);
            callback(null, {} );
        });
    })
    .catch((promise_err) => {
        callback(promise_err);
    });
    

};

function getSpreadsheetData(document_URL, sheet_name) {
    return new Promise((resolve, reject) => {
        
        var options = {
            key: document_URL,
            callback: onLoad, 
            simpleSheet: false
        };
        
        function onLoad(data, tabletop) {
            
            // if (data == "" || data == null || data == undefined) {
            //     reject("Error loading data");
            //     return;
            // }
            
            resolve(tabletop.sheets(sheet_name).all());
            
        }
        
        Tabletop.init(options);
        
    });
}

function searchSheet(search_query, sheet_data, search_columns) {
    return new Promise((resolve, reject) => {
        
        // gonna use batch-extract with multiple fields:
        // https://github.com/nol13/fuzzball.js#batch-extract

        var processor = function(choice) {
            var combination = "";
            search_columns.forEach(function(field){
                combination += choice[field] + " ";
            });
            return combination;
        };

        // set the fuzzy options
        var fuzz_options = {
            scorer: fuzz.partial_ratio,
            processor: processor,
            limit: num_rows_to_send_back,
            cutoff: 50,
            unsorted: false
        };
        
        // // funciton used above for combining several columns
        // // into one thing to search

        
        // perform the fuzzy search
        var results = fuzz.extract(search_query, sheet_data, fuzz_options);
        
        console.log(results);
        resolve(results);
        
    });
}

function makeSlackMessage(items) {
    
    var slack_message = {};
    var attachments = [];
    
    if (items === undefined || items.length < 1 || !items) {
        
        slack_message.text = "Hmmmm ... I couldn't find any data sources matching that term in the list. Try again?";
        return(slack_message);
    
    }
    
    for (var i = 0; i <  items.length; i ++) {
        
        var item = items[i][0];
        
        var attach = {
            "fallback": item['Product'] + " from " + item['Source'],
            "color": "#36a64f",
            "author_name": item['Source'],
            "title": item['Product'],
            "title_link": item['Product URL'],
            "text": "Coverage: " + item['Coverage'] + "\nGranularity: " + item['Granularity'] + "\n"
        };

        // add fallback to the first item only
        if (i == 0) {
            attach.pretext =  "Here are my top matching data sources. Explore the <" + spreadsheet_published_url + "| full source list here>.";
        }
        
        // if there are notes, add them to the text field
        if (item['Notes'] !== "") {
            attach.text += item['Notes'];
        }

        attachments.push(attach);
        
    }
    
    slack_message.attachments = attachments;
    return(slack_message);
    
}
