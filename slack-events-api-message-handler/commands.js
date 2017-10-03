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
    archive: {
        type: 'lambda',
        functionName: 'quackbot-archive-bot',
        usage: 'archive <url>',
        description: 'Save a URL to the Internet Archive.',
    },
    cliches: {
        type: 'lambda',
        functionName: 'quakcbot-cliches',
        usage: 'Look for cliches on <url>',
        descrition: 'Scan a web page for cliches.'
    }
};
