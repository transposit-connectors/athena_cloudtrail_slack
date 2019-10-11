(params) => {
  let text = "test";
   api.run("this.post_chat_message", {
      text: text
    });
  return {
    mission: "complete"
  };
}