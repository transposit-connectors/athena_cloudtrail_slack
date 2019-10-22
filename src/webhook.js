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

  const bucket_name = env.get('cloudtrail_bucket_name');
  const athena_prefix = env.get('athena_results_prefix')
  const text_we_saw = http_event.parsed_body.event.text;
  const sent_by_bot = http_event.parsed_body.event.bot_id != null;
  const command_text = "check out"
  const error_message = "Hello there. I saw: " + text_we_saw + ". But I don't understand what to do. Please ask me to '"+command_text+" [event_id]'";

  if (sent_by_bot) {
    return {
      status_code: 200,
    };
  }

  const understood_command = text_we_saw.includes(command_text);

  if ((!text_we_saw) || (!understood_command)) {
    setImmediate(() => {
      api.run("this.post_chat_message", {
        text: error_message
      });
    });
    return {
      status_code: 200,
    };
  }

  let text = "";
  let event_id = "";
  if (understood_command) {
    const command_args = text_we_saw.split(/ +/);
    if (command_args.length >=4) {
      event_id = command_args[3];
      text = "OK, I'll look at event "+event_id+" .... This may take a minute."
    } else {
      text = error_message;
    }
  }

  setImmediate(() => {
    api.run("this.post_chat_message", {
      text: text
    });

    const athena_output_s3_path = "s3://" + bucket_name + "/" + athena_prefix;
    const results = api.run("athena_library.runQuery", {
      query: "select * from cloudtrail_enriched where eventid = "+event_id,
      resultlocation: athena_output_s3_path
    })[0];
    const queryId = results.queryId;
    stash.put("query-id", queryId);
  });

  let moment = require('moment-timezone-with-data.js');
  let inOneMinute = moment().add(1, "minute").format();
  task.create("this.post_user_query_results_to_slack")
    .runOnce(inOneMinute);

  return {
    status_code: 200,
  };
}