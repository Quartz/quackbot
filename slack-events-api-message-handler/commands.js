module.exports = {
    screenshot: {
        type: 'lambda',
        functionName: 'quackbot-screenshot',
        usage: 'screenshot www.example.com',
        description: 'Grabs a screenshot of a website and Slacks it at you.'
    },
};
