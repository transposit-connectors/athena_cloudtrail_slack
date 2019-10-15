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
 LOCATION 's3://mooreds-cloudtrail/processed/AWSLogs/425414788231/CloudTrail';

