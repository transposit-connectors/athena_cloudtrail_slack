(params) => {
  const bucket_name = 'mooreds-cloudtrail';
  const processed_prefix = 'processed/';
  const results = api.run("this.list_objects",{
    bucket_name: bucket_name,
    log_path: 'AWSLogs/425414788231/CloudTrail/' // CloudTrail/us-east-2/2019/10/'
  });
  

  
  const ip_address_to_country = {}; // to save on ip calls, we only get 10k
  results.forEach((keyObj) => {
    const result_records = [];
    //console.log(keyObj.Key);
    const key = keyObj.Key;
    const content = api.query("SELECT * FROM aws_s3.get_object WHERE Bucket=@bucket_name AND Key=@key",{key:key, bucket_name: bucket_name});
    //console.log(content);
    //if (content )
    content.forEach((record_obj) => {
      const records = record_obj.Records;
      const record_keys = Object.keys(records);
      //console.log(record_keys);
      record_keys.forEach((rk) => {
        const entry = records[rk];
        if (entry.sourceIPAddress) {
          const ip = entry.sourceIPAddress;
          if (ip_address_to_country[ip] === undefined) {
            const country_code = api.run("this.get_country_from_ip",{ipaddress:ip})[0];
            ip_address_to_country[ip] = country_code;
          }
          if (ip_address_to_country[ip] != 'US') {
            entry.xpriority = "HIGH";
          }
        }
        if (entry.eventSource == "iam.amazonaws.com") {
          entry.xpriority = "HIGH";
        }
        if (entry.eventSource == "s3.amazonaws.com") {
          entry.xpriority = "MED";
        }
        result_records.push(entry);
      });
      
    });
    const result_object = {};
    result_object.Records = result_records;
    const processed_key = processed_prefix + key;
    const res = api.query("SELECT * FROM aws_s3.put_object WHERE Bucket=@bucket_name AND Key=@key AND $body=@body",
                          {
      bucket_name: bucket_name,
      key: processed_key,
      body: JSON.stringify(result_object);
    })
    //console.log(content[0]);
  });
  console.log("here");
  console.log(ip_address_to_country);
  console.log("there");
  return results;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */