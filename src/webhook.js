/**
 * This operation is an example of a JavaScript operation deployed as a Webhook
 * and configured to work with Slack.
 *
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/building/webhooks
 */
({ http_event }) => {
  if (http_event.parsed_body.challenge) {
  	return {
    	status_code: 200,
    	headers: { "Content-Type": "text/plain" },
    	body: http_event.parsed_body.challenge
  	};
	}
  console.log("here");
  console.log(http_event.parsed_body);
  setImmediate(() => {
    api.run("this.post_chat_message",{text: "hello there"});
  });
   return {
    status_code: 200,
  };
}
