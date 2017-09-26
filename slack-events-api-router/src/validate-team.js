function validateTeam(slackEvent) {
    return new Promise((resolve, reject) => {
        
        // here's where we check the team
        // to see if it's ok'd by DocumentCloud
        // and to get the bearer token
        
        /// temporary values for testing
        var validation = {
            "bearer": process.env.DOCCLOUD_BOT_TOKEN,
            "cleared": false
        };
        resolve(validation);
        
        // TK: if getting validation fails, reject with error
        
    });
}

module.exports = validateTeam;
