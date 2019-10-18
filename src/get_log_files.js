(params) => {
  const bucket_name = 'mooreds-cloudtrail';
  const processed_prefix = 'processed/';
  const stash_suffix = "-processed";
  
  const enrich_cloudtrail_object = function(entry, ip_address_to_country) {
     // break this out to a sep function for easy editing?
        if (entry.sourceIPAddress) {
          const ip = entry.sourceIPAddress;
          if (ip_address_to_country[ip] === undefined) {
            const country_code = api.run("this.get_country_from_ip",{ipaddress:ip})[0].country_code;
            ip_address_to_country[ip] = country_code;
          }
          if (ip_address_to_country[ip] != 'US') {
            entry.xpriority = "HIGH";
            entry.xcountry_code = ip_address_to_country[ip];
            console.log("saw non us country");
          }
        }
        if (entry.eventSource == "iam.amazonaws.com") {
          entry.xpriority = "HIGH";
          console.log("saw IAM event");
        }
        if (entry.eventSource == "s3.amazonaws.com") {
          entry.xpriority = "MED";
        }
  };
  
  const results = api.run("this.list_objects",{
    bucket_name: bucket_name,
    log_path: 'AWSLogs/425414788231/CloudTrail/' // CloudTrail/us-east-2/2019/10/'
  });
  
  let high_priority_records = [];
  let count = 0;
  const ip_address_to_country = {}; // to save on ip calls, we only get 10k
  results.forEach((keyObj) => {
    const result_records = [];
    //console.log(keyObj.Key);
    const key = keyObj.Key;
    if (stash.get(key+stash_suffix)) {
      return;
    }
    const content = api.query("SELECT * FROM aws_s3.get_object WHERE Bucket=@bucket_name AND Key=@key",{key:key, bucket_name: bucket_name});
    //console.log(content);
    //if (content )
    content.forEach((record_obj) => {
      const records = record_obj.Records;
      const record_keys = Object.keys(records);
      //console.log(record_keys);
      record_keys.forEach((rk) => {
        const entry = enrich_cloudtrail_object(records[rk], ip_address_to_country);
        result_records.push(entry);
      });
    });
    
    high_priority_records.push(result_records.filter(r => {
      return r && r.xpriority == 'HIGH';
    }));
    

    
    // athena wants json with each record on a different line
    const body = result_records.map(r => JSON.stringify(r)).join("\n");
    // can't gzip it just yet
    const processed_key = (processed_prefix + key).replace(".gz","");
    console.log("pushing: "+processed_key);
    const res = api.query("SELECT * FROM aws_s3.put_object WHERE Bucket=@bucket_name AND Key=@key AND $body=@body", {
      bucket_name: bucket_name,
      key: processed_key,
      body: body
    });
    
    
    //console.log(res);
    if (res != "success") {
      console.log("error processing: "+key);
    } else {
      stash.put(key+stash_suffix,true);
      count++;
    }
    //console.log(content[0]);
  });
  // console.log("here");
  // console.log(ip_address_to_country);
  // console.log("there");
    
  return { 
    status: 200,     
    count: count,
    high_priority_records: high_priority_records
  };
}
