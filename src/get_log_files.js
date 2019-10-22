(params) => {
  const bucket_name = env.get('cloudtrail_bucket_name');
  const processed_prefix = env.get('cloudtrail_processed_prefix');
  const stash_suffix = "-processed";

  const enrich_cloudtrail_object = function(entry, ip_address_to_country) {
    if (entry.sourceIPAddress) {
      const ip = entry.sourceIPAddress;
      if (ip_address_to_country[ip] === undefined) {
        const country_code = api.run("this.get_country_from_ip", {
          ipaddress: ip
        })[0].country_code;
        ip_address_to_country[ip] = country_code;
      }
      if (ip_address_to_country[ip] != 'US') {
        entry.xpriority = "HIGH";
        entry.xcountry_code = ip_address_to_country[ip];
        console.log("saw non us country");
      }
    }
    if (entry.eventSource == "iam.amazonaws.com" && entry.eventName == "CreateUser") {
      entry.xpriority = "HIGH";
    }
    return entry;
  };

//   const regions = api.query("SELECT DescribeRegionsResponse.regionInfo.item FROM aws_ec2.describe_regions")[0];

//   const regionNames = [];
//   regions.item.forEach(r => {
//     regionNames.push(r.regionName);
//   });

//   const moment = require('moment-timezone-with-data.js');
//   const year_month = moment().format('/YYYY/MM/');
//   const year_month_day_for_yesterday = moment().add(-1).format('/YYYY/MM/dd/')
//   let results = [];
//   const log_path_prefix = env.get('cloudtrail_initial_prefix');
//   regionNames.forEach(rn => {

//     const log_path = log_path_prefix + rn + year_month; // +"18/" for testing only
//     //console.log(log_path);
//     const one_region_results = api.run("this.list_objects", {
//       bucket_name: bucket_name,
//       log_path: log_path
//     });

//     results = results.concat(one_region_results);

//     const log_path_yesterday = log_path_prefix + rn + year_month_day_for_yesterday; // pick up yesterday just in case
//     const one_region_results_yday = api.run("this.list_objects", {
//       bucket_name: bucket_name,
//       log_path: log_path_yesterday
//     });
//     results = results.concat(one_region_results_yday);
//   });

  const log_path_prefix = env.get('cloudtrail_initial_prefix');
  const results = api.run("this.list_objects", {
      bucket_name: bucket_name,
      log_path: log_path_prefix
    });
  
  let high_priority_records = [];
  let count = 0;
  const ip_address_to_country = {}; // to save on ip calls, we only get 10k
  results.forEach((keyObj) => {
    
    const result_records = [];
    const key = keyObj.Key;
    console.log("processing: "+key);
    if (stash.get(key + stash_suffix)) {
      console.log("saw this, skipping: "+key);
      return;
    }
    const content = api.query("SELECT * FROM aws_s3.get_object WHERE Bucket=@bucket_name AND Key=@key", {
      key: key,
      bucket_name: bucket_name
    });
    content.forEach((record_obj) => {
      const records = record_obj.Records;
      const record_keys = Object.keys(records);
      record_keys.forEach((rk) => {
        const entry = enrich_cloudtrail_object(records[rk], ip_address_to_country);
        result_records.push(entry);
      });
    });

    const high_priority_results = result_records.filter(r => {
      return r && r.xpriority == 'HIGH';
    })
    high_priority_records = high_priority_records.concat(high_priority_results);
    
    // athena wants json with each record on a different line
    const body = result_records.map(r => JSON.stringify(r)).join("\n");
    // can't gzip it just yet
    const processed_key = (processed_prefix + key).replace(".gz", "");
    const res = api.query("SELECT * FROM aws_s3.put_object WHERE Bucket=@bucket_name AND Key=@key AND $body=@body", {
      bucket_name: bucket_name,
      key: processed_key,
      body: body
    });

    if (res != "success") {
      console.log("error processing: " + key);
    } else {
      stash.put(key+stash_suffix,true);
        const channel_name = env.get('slack_channel');

      count++;
      if (high_priority_records.length > 0) {
        const message = "Here are the high priority events, please investigate: \n" + (high_priority_records.map(r => {
          return r.eventID + "/" + r.eventSource + "/" + r.eventName
        }).join("\n"));
        api.run("this.post_chat_message", {
          text: message,
          channel: channel_name
        });
      }
    }
  });

  return {
    status: 200,
    count: count,
    high_priority_records: high_priority_records
  };
}
