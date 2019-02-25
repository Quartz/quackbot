var filechecker = require('./index');
var ApiBuilder = require('claudia-api-builder');
var api = new ApiBuilder();

module.exports = api;

api.post(`/checkfiles`, function(request){
  // bulding the reply (repsonse)
  // which first sends the request object to sparkbot for processing
  return filechecker(request)
  
    // wait for the Promise object to come back from the bot code
    .then(function(response){
      // send the response back to the requester
      return response;
    });
    
  }, {
    // this optional 3rd argument changes the format of the response
    success: { contentType: 'application/json' },
    error: { contentType: 'application/json' }
});