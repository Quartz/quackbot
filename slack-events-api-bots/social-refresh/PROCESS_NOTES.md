# Process Notes for the Social-Refresh bot


## Prepping for Lambda

We worked to put Ryan Restivo's code into a function that will be called by the AWS system. [More details here](https://docs.aws.amazon.com/lambda/latest/dg/python-programming-model-handler-types.html), but the basic setup is:

```python
def handler_name(event, context): 
    ...
    return some_value
``` 

... where the `event` and `context` come in from whatever triggers the lambda function.

## Deploying to Lambda using AWS SAM

I initially started using [Zappa](https://github.com/Miserlou/Zappa) which is clearly amazing if you want to put your lambda function at the end of an API -- or any other AWS event for that matter. But I'm making a function that's invoked by other functions -- not by API Gateway -- and I simply could not figure out how to configure it correctly for that.

So I went with Amazon's version called [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-using-build.html) ... which truthfully was a little daunting, but the end result was much clearer to me.

Some other pages I used: 

- [Serverless deploying](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-deploying.html)
- [Command Line Interface](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-reference.html#serverless-sam-cli)
- [Docker](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

FWIW, I installed Docker but didn't use it because I generally deploy to test stuff. But looks like it would simulate the lambda function locally.

## Installation Steps

1. Installed [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-macos.html#awscli-install-osx-pip) (which I had already).
1. Downloaded and installed [Docker](https://hub.docker.com/editions/community/docker-ce-desktop-mac) for locally running the functions on my Mac.
1. Installed [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html).
1. Added the SAM CLI to my Python $PATH [this way](https://www.architectryan.com/2012/10/02/add-to-the-path-on-mac-os-x-mountain-lion/).
1. Opened a new Terminal window so all the paths got loaded


## Permissions 

This whole document assumes you have the permissions to do lots of stuff on your AWS account. TODO: Include information on how to set all that up!

## Exploration

I probably won't do this part again, but to get familiar and to experiment, I followed along with [this guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-reference.html#serverless-sam-cli) to create an initial app to work off of -- making sure to declare the Python 2.7 version (otherwise it built it in Node).

```
sam init --runtime python2.7
```

This ends up in a `/sam-app` directory which I've saved untouched in this repo for reference.

It also generates a `README.md` that has information I didn't see elsewhere.

It also creates the `template.yaml` file I modified later for my own use.


## Preparing, building and deploying.

### Made a project directory

This should be a folder devoted only to the various things we'll need for this particular lambda function. Eventually, it will have the following:

```
project_name/
    app/
        __init_.py
        app.py
        requirements.txt
    venv/
        lots of virtual environment stuff
    .gitignore
    template.yaml
```

### Setting up the virtual environment

Using virtualenv to keep my Python packages and dependencies pulled together nicely.

```bash
# installing virtualenv
pip install virtualenv

# move into the project directory
cd ..[path to my project]

# create a virtual environment called 'venv' there
# using the python2.7 version already on my system
virtualenv -p /usr/bin/python2.7 venv

# activate the virtual environment
source venv/bin/activate
```

### All the dependencies in order

In the project directory, I started the virtual environment.

```
source venv/bin/activate
```

Made sure all of my dependencies where installed using `pip` while in the venv. ie: 

```
pip install requests
```

### The app/ directory

I'm going to collect the operational code into the `/app` directory, so made that:

```
mkdir app
```

Made a `requirements.txt` file and moved that into the `/app` directory

```
pip freeze > requirements.txt
mv requirements.txt app/
```

I also made a blank `__init__.py` file, as the example has.

```
touch __init__.py
```

Took the python file with the lambda function's actual code, renamed it `app.py` and put it in the `app/` directory.

**Important note:** The actual code in `app.py` includes a function called `lambda_handler` ... which is where the lambda function itself should live. That function looks like this:

```python
def lambda_handler(event, context): 
    ...
    return some_value
``` 

The combination of the `app.py` file name and this function's name `lambda_handler` is what AWS refers to as the "handler," which in this case is `app.lambda_handler` --  `[filename].[functionname]`. This "handler" name pops up in a few places, so I'm keeping the file name and handler function standard in my projects.

Finally, I needed to make sure all the files in the `/app` directory are globally readable. If they are not, jump in the directory and change 'em. 

```
cd app
chmod 444 *.*
cd ..
```

### The deploy template

In the project's root directory, create a `template.yaml` file.

I did a bunch of fixing of the `template.yaml` file, based on values listed [here](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md).

The trickiest part will be creating a role, which I'll describe when I can.

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
    Function:
        Timeout: 3

Resources:

    MyFunction:
        Type: AWS::Serverless::Function
        Properties:
            FunctionName: quackbot-social-refresh
            Description: The Social Refresh superpower for Quackbot, by Ryan Restivo
            Role: arn:aws:iam::612251176106:role/botstudio-quackbot-lambda-execution
            CodeUri: app/
            Handler: app.lambda_handler
            Runtime: python2.7

Outputs:

    MyFunction:
      Description: "Your Function ARN"
      Value: !GetAtt MyFunction.Arn
```

### Build and deploy

This process will make a new folder called `.aws-sam` where all the files and dependencies will be copied. Then that folder gets uploaded to an S3 bucket and deployed to Lambda. To do this, we'll need a new bucket.

Made a new bucket:

```
aws s3 mb s3://botstudio-lambda-payload-staging
```

Then put it all together with these lines, changing the values for `--s3-bucket` and `--stack-name` -- which I learned is an AWS Cloud Formation thing I have never used before so just gave it the project's name plus `-stack`.

```
sam build
sam package --output-template-file packaged.yaml --s3-bucket botstudio-lambda-payload-staging
sam deploy --template-file packaged.yaml --stack-name quackbot-social-refresh-stack --capabilities CAPABILITY_IAM
```

Golly, it worked. 



