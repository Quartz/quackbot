# Quackbot: A Slack bot for journalists

![Quackbot](.images/quackbot-icon_108.png)

[Quartz](https://qz.com) and [DocumentCloud](http://documencloud.org) have teamed up to give journalists convenient access to tools that make their work easier, better, and a little more fun. Together we’re releasing Quackbot, which performs tasks useful to reporters, editors, and news producers right where so many of us work all day -- inside [Slack](http://slack.com).

In its first version, Quackbot can do a select few tricks that might prove handy in a modern newsroom, from grabbing screenshots of webpages to pointing out clichés. But we’re excited to collaborate with the rest of the journalism world to give Quackbot many more skills over time. Think of it as a fully hosted and friendly interface to open-source tools.

The [full announcement is here](https://bots.qz.com/2017/10/03/announcing-quackbot-a-slack-bot-for-journalists-from-quartz-and-documentcloud/).

## Just a duckling

As of now, Quackbot can:

- Can take a screenshot of any webpage.
- Will preserve any URL by telling the Internet Archive to save a copy of the page.
- Suggest some reliable sources of data.
- Identify any cringe-worthy clichés on a web page, given a URL.

Soon, Quackbot will also allow journalists to upload PDFs to DocumentCloud, extract text and charts from PDFs, monitor websites for changes, make quick charts, and more. We’re also inviting other journalists to bring their tools into Quackbot, making them readily available within Slack. If you’d like to add yours, please reach out to us at bots@qz.com.

## Installing

Quackbot will be available starting this Thursday. All you’ll need is a DocumentCloud account (free for any journalist) and Slack. Add Quackbot to your team and, once the DocumentCloud team has verified you, we’ll activate it. That’s it.

An installation link will appear here soon. In the meantime, if you're interested you can add your name and email to [this form](https://docs.google.com/forms/d/e/1FAIpQLSeSXJrqd-_uIaN8riPNsn1Wk66y8AtGQbuBLGSk6aLGicj3fQ/viewform?usp=sf_link).

## Using Quackbot

Once added to a Slack team, people on the team can DM Quackbot. They can also start a message with `@quackbot` in any channel to which Quackbot has been invited.

Use natural phrases and sentences to tap into Quackbot's talents. Like:

- "Take a screenshot of qz.com"
- "Save documentcloud.com to the internet archive" or "archive documentcloud.com"
- "Find data about agriculture"

## Privacy and security notes

In short, Quackbot only "listens" to direct messages and channels to which it has been invited. And in public channels it's invited to, only pays attention to messages that begin with `@quackbot`.

Here's the long version:

Quackbot relies on Slack's [Events API](https://api.slack.com/events-api), which only sends messages that are in direct messages or channels in which Quackbot is a participant. 

In channels where Quackbot has been invited, messages that don't begin with `@quackbot` are ignored and are not written to our logs.

Quackbot uses [AWS Lambda](https://aws.amazon.com/lambda/) serverless functions operated by DocumentCloud. Credentials that allow the bot to communicate with a team are stored in a Postgres database in AWS, also operated by DocumentCloud.

Messages processed by Quackbot (direct messages addressed to the bot or channel messages beginning with `@quackbot`) are processed by the Lambda functions and are also relayed to [API.ai](http://api.ai) for natural language processing. While we work to keep the contents of user messages out of our logs, Amazon Web Services and API.ai may keep logs of user queries.

All communications in transit are protected via [SSL](https://en.wikipedia.org/wiki/Transport_Layer_Security) using `https` calls.

For transparency, all the code for all of Quackbot's functions is kept in public, in this repository.


