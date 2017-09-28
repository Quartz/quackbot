module.exports = {
    screenshot: {
        type: 'lambda',
        functionName: 'quackbot-screenshot',
        usage: 'screenshot www.example.com',
        description: 'Grabs a screenshot of a website and Slacks it at you.',
    },
    data: {
        type: 'lambda',
        functionName: 'quack-search-sheet',
        usage: 'data agriculture',
        description: 'Searches Christopher Groskopf\'s spreadsheet of good data sources.',
    },
};
