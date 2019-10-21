# CloudTrail To Slack

## Before you start

You'll need a free Transposit account and a free [ipstack](https://ipstack.com/) account. You'll also need the ability to install an application on Slack.

You'll also need an AWS account. You'll need to create an S3 bucket and enable CloudTrail to write to that bucket. You'll need to create an IAM user with the following permissions:

  * `AmazonS3FullAccess`
  * `AmazonAthenaFullAccess`
  * `AmazonEC2ReadOnlyAccess` # only to read all the regions available

## Slack setup

  * Create or choose a channel for the posts. Suggested names: 'cloudtrail' or 'cloudtrail_alerts'.

## Transposit setup

  * Fork the app [https://console.transposit.com/t/transposit-sample/athena_cloudtrail_slack](https://console.transposit.com/t/transposit-sample/athena_cloudtrail_slack) (find the Fork button at the top of the editor view).
  * Edit the `enrich_cloudtrail_object` function at the top of the `get_log_files` operation. This is where you can mark certain events high priority. Currently the sample code flags the following events as high priority:
    * Creation of a new IAM user
    * Access to any API from a non US IP address.
  * Navigate to **Deploy > Production Keys** and add keys for all the data connectors.
  * Navigate to **Deploy > Environment Variables** and fill out the following environment variables:
    * `cloudtrail_bucket_name`: the name of your cloudtrail bucket.
    * `cloudtrail_initial_prefix`: the prefix to your CloudTrail log files. If you accept the default setup, it is: `AWSLogs/xxxxxxx/CloudTrail/` where `xxxxxxx` is your AWS account number.
    * `cloudtrail_processed_prefix`: by default the system stores the enriched log files in the same bucket and key as the unprocessed CloudTrail logs, except the key has this prefix added to it.
    * `athena_results_prefix`: the location (under `cloudtrail_bucket_name`) where we store Athena results.
    * `slack_channel`: the name of the Slack channel you created above.
  * Navigate to **Deploy > Scheduled Tasks** and set up the `scheduled_job` operation on whatever schedule you'd like notifications to occur.

