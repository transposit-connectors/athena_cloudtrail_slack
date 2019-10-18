(params) => {
  const channel_name = 'cloudtrail';
  const process_log_files_result = api.run("this.get_log_files")[0];
  if (process_log_files_result.count > 0) {
    const count = process_log_files_result.count;
    const text = "Processed "+count+" cloudwatch log file" + (count == 1 ? "" : "s");
	api.run("this.post_chat_message",{text:text, channel: channel_name});
    
    const message = "Here are the high priority events, please investigate: "+ (process_log_files_result.high_priority_records.map(r => {
      return e.eventID
    }).join("\n"));
          
    api.run("this.post_chat_message", {text: message, channel: channel_name});
  }

}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */