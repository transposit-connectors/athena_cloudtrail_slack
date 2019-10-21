(params) => {
  let text = "The following high priority events happened recently\n";
  const queryId = stash.get("query-id");
  const results = api.run("athena_library.getQueryResults", {
    queryId: queryId
  });

  text += results.map((r) => {
    return "event " + r.eventid + " happened at " + r.eventtime + " in region: " + r.awsregion;
  }).join("\n");

  api.run("this.post_chat_message", {
    text: text
  });
  return {
    mission: "complete"
  };
}
