(params) => {
  const channel_name = env.get('slack_channel');
  const process_log_files_result = api.run("this.get_log_files")[0];
  if (process_log_files_result.count > 0) {
    const count = process_log_files_result.count;
    const text = "Processed " + count + " cloudwatch log file" + (count == 1 ? "" : "s");
    api.run("this.post_chat_message", {
      text: text,
      channel: channel_name
    });
  }
}
