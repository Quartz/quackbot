function validateTeam(request) {
    return new Promise((resolve, reject) => {
        
        // here's where we check the team
        // to see if it's ok'd by DocumentCloud
        // and to get the bearer token
        
        /// temporary values for testing
        var validation = {
            "bot_access_token": request.env.DOCCLOUD_BOT_TOKEN,
            "cleared": true,
            "bot_user_id": "U75V2FNET"
        };
        resolve(validation);
        
        // TK: if getting validation fails, reject with error
        
    });
}

module.exports = validateTeam;
