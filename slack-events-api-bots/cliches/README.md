# Cliche Finder

Given a URL, counts the cliches.

## Cliche files: 

- [681 Cliches to Avoid in Your Creative Writing](http://www.be-a-better-writer.com/cliches.html).
- Washington Post's [The Outlook List of Things We Do Not Say](https://www.washingtonpost.com/news/opinions/wp/2014/02/27/the-outlook-list-of-things-we-do-not-say/?utm_term=.dbd630e45504)
- [ProWritingAid](https://prowritingaid.com/art/21/List-of-Cliches.aspx) list of Cliches

Also:
https://www.npmjs.com/package/unfluff
https://www.npmjs.com/package/fast-csv


## Setting Up Claudia

```
npm install claudia --save-dev
```

In this app, the bot runs in `index.js`.

Note that "index.handler" below comes from the name of the file `index.js` and the module inside `exports.handler`. Other arguments listed [here]https://github.com/claudiajs/claudia/blob/master/docs/create.md. 

```
./node_modules/.bin/claudia create --region us-east-1 --handler index.handler --role lambda_basic_execution
```

```
./node_modules/.bin/claudia update
```
