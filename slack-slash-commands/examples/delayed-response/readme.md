# An example Lambda function for a decoupled Slack bot with delayed response

Most bots that are Lambda functions can just be wired up directly and respond
immediately. Slack requires immediate responses to be sent in less than three
seconds—sometimes you might need more time.

1. Pick a command that you want your bot to respond to. For example, you might
   want your bot to respond when users type `/mybot ping`.

2. Edit `index.js` to do something in response to that command.

3. Create a SNS topic corresponding to that command and subscribe your Lambda
   function to it.

You might need help with step 3—just ask your friendly neighborhood #bots
channel!

## Events

See [Slack’s documentation][slack-slash-docs] for an example of what’s included
in a Slack message.

Since this code is only triggered if a user types a specific command, e.g.,
`/mybot ping hello!`, some extra information is added to the event to help you
respond:

```
{
  ...
  command: {
    verb: 'ping',
    predicate: 'hello!'
  }
}
```

[slack-slash-docs]: https://api.slack.com/slash-commands
