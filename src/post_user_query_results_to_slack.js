(params) => {
  const slack_channel = env.get('slack_channel');
  let text = "a";
  const queryId = stash.get("query-id");
  const results = api.run("athena_library.getQueryResults", {
    queryId: queryId
  });

  text += JSON.stringify(results);

  api.run("this.post_chat_message", {
    text: text,
    channel: slack_channel
  });
  return {
    mission: "complete"
  };
}
