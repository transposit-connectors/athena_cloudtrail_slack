({http_event}) => {
  if (http_event.parsed_body.challenge) {
    return {
      status_code: 200,
      headers: {
        "Content-Type": "text/plain"
      },
      body: http_event.parsed_body.challenge
    };
  }
  
  const bucket_name = 'mooreds-cloudtrail';
  const athena_prefix = 'athena-output/';
  console.log("here");
  console.log(http_event.parsed_body);
  const text_we_saw = http_event.parsed_body.event.text;
  const sent_by_bot = http_event.parsed_body.event.bot_id != null;
  
  if (sent_by_bot) {
    return {
      status_code: 200,
    };
  }
  
  const check_most_recent = text_we_saw.includes("check most recent");
  const check_yesterday = text_we_saw.includes("check yesterday");

  if (!(text_we_saw||check_most_recent)) {
    setImmediate(() => {
      api.run("this.post_chat_message", {
        text: "hello there. I saw: " + text_we_saw +". But I don't understand what to do. Please either ask me to 'check most recent'"
      });
    });
    return {
      status_code: 200,
    };
  }
  
  let text = "";
  if (check_most_recent) {
    text = "OK, I'll see if there are any recent events.... This may take a minute."
  }
  
  setImmediate(() => {
    api.run("this.post_chat_message", {
      text: text
    });
    
    const athena_output_s3_path = "s3://"+bucket_name + "/" + athena_prefix;
    console.log(athena_output_s3_path);
    const results = api.run("athena_library.runQuery", {
      query:"select * from cloudtrail_enriched where xpriority = 'HIGH' order by eventtime desc limit 5",                                
      resultlocation: athena_output_s3_path
    })[0];
    const queryId = results.queryId;
    stash.put("query-id", queryId);
    console.log(queryId);
  });
  
  let moment = require('moment-timezone-with-data.js');
  let inOneMinute = moment().add(1, "minute").format();
  task.create("this.post_user_query_results_to_slack")
    .runOnce(inOneMinute);
  
  return {
    status_code: 200,
  };
}

// TODO
// break out enrich to sep function
// make check today useful
