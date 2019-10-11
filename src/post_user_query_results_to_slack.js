(params) => {
  let text = "test";
  const queryId = stash.get("query-id");
  console.log("here5");
  console.log(queryId);
  const results = api.run("athena_library.getQueryResults", {queryId: queryId });
   
   api.run("this.post_chat_message", {
      text: text + JSON.stringify(results)
    });
  return {
    mission: "complete"
  };
}