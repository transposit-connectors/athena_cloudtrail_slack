# CloudTrail to Slack

This integration will do three things:

  * Process all CloudTrail logs and copy them to a processed directory. You can specify if there are certain events that are high priority based on any attribute of the event, and that will be recorded in the processed logfile. The default rules are:
    * Creation of a new IAM user.
    * Access to any API from a non US IP address.
  * Inform you about any high priority events seen in the logfiles by posting to Slack.
  * Upon request, return more information about any CloudTrail event: `@umbrellabot check out xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx`

## Before you start

You'll need a free Transposit account and a free [ipstack](https://ipstack.com/) account for determining the physical location of an IP address. You'll also need the ability to install an application on Slack.

## AWS setup

You'll need an AWS account. 

  * Create an S3 bucket 
  * Enable CloudTrail to write to that bucket. 
  * You'll need to create an IAM user with the following permissions:
    * `AmazonS3FullAccess`
    * `AmazonAthenaFullAccess`

## Slack setup

  * Create or choose a channel for the posts. Suggested names: 'cloudtrail' or 'cloudtrail_alerts'.

## Transposit setup

  * Fork the app [https://console.transposit.com/t/transposit-sample/athena_cloudtrail_slack](https://console.transposit.com/t/transposit-sample/athena_cloudtrail_slack) (find the Fork button at the top of the editor view).
  * Edit the `enrich_cloudtrail_object` function at the top of the `get_log_files` operation. This is where you mark interesting events with a priority. 
  * Navigate to **Deploy > Production Keys** and add keys for all the data connectors.
  * Navigate to **Deploy > Environment Variables** and fill out the following environment variables:
    * `cloudtrail_bucket_name`: the name of your cloudtrail bucket.
    * `cloudtrail_initial_prefix`: the prefix to your CloudTrail log files. If you accept the default setup, it is: `AWSLogs/xxxxxxx/CloudTrail/` where `xxxxxxx` is your AWS account number.
    * `cloudtrail_processed_prefix`: by default the system stores the enriched log files in the same bucket and key as the unprocessed CloudTrail logs, except the key has this prefix added to it.
    * `athena_results_prefix`: the location (under `cloudtrail_bucket_name`) where we store Athena results.
    * `slack_channel`: the name of the Slack channel you created above.
  * Navigate to **Deploy > Scheduled Tasks** and set up the `scheduled_job` operation on whatever schedule you'd like notifications to occur. Running every 10 minutes: `0 /10 * ? * *`

## Slack setup part 2

To interact with your bot, you need to create a Slack App. Here's the [entire guide](https://www.transposit.com/docs/guides/slack/chatbots/), but the cliff notes are:

  * Navigate to **Deploy > Endpoints Keys** and copy the `webhook` url (something like `https://athena-cloudtrail-slack-xxx.transposit.io/api/v1/execute-http/webhook?api_key=xxxx`). 
  * Create a new Slack App.
  * Create a bot user for the app (I named mine 'umbrellabot'.) 
  * Give your app the following OAuth scopes: `bot`, `chat:write:bot`. Use https://accounts.transposit.com/oauth/v2/handle-redirect for the redirect URL.
  * Subscribe to the `app_mention` event. Use the `webhook` url from above for the 'Request URL'.
  * Set up the Transposit app to act as the bot user by grabbing the client secret and following the [instructions here](https://www.transposit.com/docs/guides/slack/chatbots/#acting-as-your-bot-user).
  * Install the app to your workspace.

## AWS setup part 2

  * Create the Athena table (the script is also in the git repo). The values in brackets below need to be replaced with the real values as specified in the environment variables above.

```
CREATE EXTERNAL TABLE default.cloudtrail_enriched (
  xpriority string,
  eventTime string,
  eventName string,
  awsRegion string,
  eventSource string,
  eventID string
 )
 ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
 WITH SERDEPROPERTIES ('ignore.malformed.json' = 'true')
 LOCATION 's3://[bucketname]/[cloudtrail_processed_prefixe]/[cloudtrail_initial_prefix]';
```

