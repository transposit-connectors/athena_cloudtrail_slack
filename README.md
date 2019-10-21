# CloudTrail To Slack

## Before you start

You'll need a free Transposit account and an AWS account. You'll need to create an S3 bucket and enable CloudTrail to write to that bucket. You'll need to create an IAM users with the following permissions:

  * `AmazonS3FullAccess`
  * `AmazonAthenaFullAccess`
  * `AmazonEC2ReadOnlyAccess` # only to read all the regions available, so you can limit it further

## Slack setup

  * Create or choose a channel for the posts. Suggested names: 'cloudtrail' or 'cloudtrail_alerts'.

## Transposit setup

  * Fork the app [https://console.transposit.com/t/transposit-sample/athena_cloudtrail_slack](https://console.transposit.com/t/transposit-sample/athena_cloudtrail_slack) (find the Fork button at the top of the editor view).
  * Navigate to **Deploy > Environment Variables** and fill out the following environment variables:
    * 
  * Navigate to **Deploy > Scheduled Tasks** and set up the `scheduled_job` operation on whatever schedule you'd like notifications to occur.

