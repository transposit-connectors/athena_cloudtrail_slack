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
  
  console.log("here");
  console.log(http_event.parsed_body);
  const text_we_saw = http_event.parsed_body.event.text;
  const sent_by_bot = http_event.parsed_body.event.bot_id != null;
  
  if (sent_by_bot) {
    return {
      status_code: 200,
    };
  }
  
  const check_today = text_we_saw.contains("check today");
  const check_yesterday = text_we_saw.contains("check yesterday");

  if (!text_we_saw) {
    setImmediate(() => {
      api.run("this.post_chat_message", {
        text: "hello there. I saw: " + text_we_saw +". But I don't understand what to do. Please either ask me to 'check today' or 'check yesterday'"
      });
    });
  }
  
  if (!(check_today || check_yesterday)) {
    setImmediate(() => {
      api.run("this.post_chat_message", {
        text: "hello there. I saw: " + text_we_saw +". But I don't understand what to do. Please either ask me to 'check today' or 'check yesterday'"
      });
    });
  }
  
  return {
    status_code: 200,
  };
}