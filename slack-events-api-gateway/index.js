const ApiBuilder = require('claudia-api-builder');
const postMessage = require('./routes/messages-post');

const api = new ApiBuilder();

api.post('/messages', postMessage.bind(null, api));

module.exports = api;
