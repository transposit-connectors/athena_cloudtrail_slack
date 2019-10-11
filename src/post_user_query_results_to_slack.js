(params) => {
  let text = "test";
  const queryId = stash.get("query-id");
  const results = api.run("athena_library.getQueryResults", {queryId: queryId });
   
   api.run("this.post_chat_message", {
      text: text + JSON.stringify(results)
    });
  return {
    mission: "complete"
  };
}