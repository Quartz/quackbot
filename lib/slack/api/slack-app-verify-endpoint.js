function verifyEndpoint(data) {
  return { challenge: data.challenge };
}

module.exports = verifyEndpoint;
