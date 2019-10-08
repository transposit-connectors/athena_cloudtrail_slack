(params) => {
  const process_log_files_result = api.run("this.get_log_files")[0];
  if (process_log_files_result.count > 0) {
    const count = process_log_files_result.count;
    const text = "Processed "+count+" cloudwatch log file" + (count == 1 ? "" : "s");
	api.query("SELECT * FROM slack.post_chat_message WHERE $body=(SELECT { 'channel' : 'cloudtrail','as_user' : false, 'text' : @text})",{text:text});
  }
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */