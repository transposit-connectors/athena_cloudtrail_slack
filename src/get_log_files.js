(params) => {
  const bucket_name = 'mooreds-cloudtrail';
  const processed_prefix = 'processed/AWSLogs/425414788231/CloudTrail/us-east-2/2019/10/';
  const results = api.run("this.list_objects",{
    bucket_name: bucket_name,
    log_path: 'AWSLogs/425414788231/CloudTrail/' // CloudTrail/us-east-2/2019/10/'
  });
  results.forEach((keyObj) => {
    //console.log(keyObj.Key);
    const content = api.query("SELECT * FROM aws_s3.get_object WHERE Bucket=@bucket_name AND Key=@key",{key:keyObj.Key, bucket_name: bucket_name});
    //console.log(content);
    //if (content )
    content.forEach((record_obj) => {
      const records = record_obj.Records;
      const record_keys = Object.keys(records);
      //console.log(record_keys);
      record_keys.forEach((rk) => {
        const entry = records[rk];
        if (entry.eventSource == "s3.amazonaws.com") {return}
               if (entry.eventSource == "dynamodb.amazonaws.com") {return}
        if (entry.eventSource == "sns.amazonaws.com") {return}
        if (entry.eventSource == "autoscaling.amazonaws.com") {return}
        if (entry.eventSource == "cloudtrail.amazonaws.com") {return}
        if (entry.eventSource == "monitoring.amazonaws.com") {return}
        if (entry.eventSource == "kms.amazonaws.com") {return}
        if (entry.eventSource == "resource-groups.amazonaws.com") {return}
        if (entry.eventSource == "logs.amazonaws.com") {return}
        if (entry.eventSource == "config.amazonaws.com") {return}
        if (entry.eventSource == "lambda.amazonaws.com") {return}
      console.log("pi: "+entry.userIdentity.principalId);
      console.log("t: "+entry.eventTime);
      console.log("sip: "+entry.sourceIPAddress);
      console.log("en: "+entry.eventName);
        console.log("es: "+entry.eventSource);
      });
    
    });
    //console.log(content[0]);
  });
  return results;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */