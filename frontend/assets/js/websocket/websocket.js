// selectedchat is by default General.
var selectedchat = "general";
let conn;
/**
 * Event is used to wrap all messages Send and Recieved
 * on the Websocket
 * The type is used as a RPC
 * */
class Event {
  // Each Event needs a Type
  // The payload is not required
  constructor(type, payload) {
    this.type = type;
    this.payload = payload;
  }
}
/**
 * routeEvent is a proxy function that routes
 * events into their correct Handler
 * based on the type field
 * */
function routeEvent(event) {
  if (event.type === undefined) {
    alert("no 'type' field in event");
  }
  switch (event.type) {
    case "new_message":
      console.log("new message");
      break;
    default:
      alert("unsupported message type");
      break;
  }
}

/**
 * changeChatRoom will update the value of selectedchat
 * and also notify the server that it changes chatroom
 * */
function changeChatRoom() {
  // Change Header to reflect the Changed chatroom
  var newchat = document.getElementById("chatroom");
  if (newchat != null && newchat.value != selectedchat) {
    console.log(newchat);
  }
  return false;
}

/**
 * sendEvent
 * eventname - the event name to send on
 * payload - the data payload
 * */
export function sendEvent(eventName, payload) {
  // Create a event Object with a event named send_message
  const event = new Event(eventName, payload);
  // Format as JSON and send
  conn.send(JSON.stringify(event));
}

/**
 * Once the website loads, we want to apply listeners and connect to websocket
 * */
// export function connectWebsocket(otp)
export function connectWebsocket(otp) {
  if (window["WebSocket"]) {
    console.log("Supports WebSockets");

    try {
      console.log("Connecting to Websocket");
      conn = new WebSocket("ws://localhost:8081/ws?otp=" + otp);
      // conn = new WebSocket("ws://localhost:8081/ws");

      conn.onopen = function (e) {
        console.log("WebSocket connection established");
        const websocketStatus = {status: "connected"};
        localStorage.setItem("websocketStatus",JSON.stringify(websocketStatus));
      };

      conn.onclose = function(e) {
       console.log("WebSocket connection closed");
    }

      conn.onmessage = function (e) {
        console.log(e);

        const eventData = JSON.parse(e.data);

        const event = Object.assign(new Event(), eventData);
        console.log(event);

        routeEvent(event);
        return conn;
      };

      return conn;
    } catch (error) {
      console.error("WebSocket connection could not be established:", error);
    }
  } else {
    alert("WebSockets are not supported in this browser.");
  }
}

window.addEventListener("load", function () {
  const websocketStatus = localStorage.getItem("websocketStatus");
  if (websocketStatus) {
    const statusObj = JSON.parse(websocketStatus);
    if (statusObj.status === "connected") {
      console.log("Reconnecting to websocket");
      connectWebsocket();
    }
  }
});
