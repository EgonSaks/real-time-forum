let conn;

import { appendChatMessage } from "../components/chat.js";
class Event {
  constructor(type, payload) {
    this.type = type;
    this.payload = payload;
  }
}

export class SendMessageEvent {
  constructor(message, from) {
    this.message = message;
    this.from = from;
  }
}

export class NewMessageEvent {
  constructor(message, from, sent) {
    this.message = message;
    this.from = from;
    this.sent = sent;
  }
}

class ChangeChatRoomEvent {
  constructor(name) {
    this.name = name;
  }
}

function routeEvent(event) {
  if (event.type === undefined) {
    alert("no 'type' field in event");
  }
  switch (event.type) {
    case "new_message":
      const messageEvent = Object.assign(new NewMessageEvent(), event.payload);
      appendChatMessage(messageEvent);
      break;
    default:
      alert("unsupported message type");
      break;
  }
}

export function sendEvent(eventName, payload) {
  const event = new Event(eventName, payload);
  conn.send(JSON.stringify(event));
}

export function connectWebSocket(otp) {
  if (window["WebSocket"]) {
    // console.log("Supports WebSockets");

    try {
      // console.log("Connecting to WebSocket");
      conn = new WebSocket("ws://localhost:8081/ws?otp=" + otp);

      conn.onopen = function (e) {
        // console.log("WebSocket connection established");
      };

      conn.onclose = function (e) {
        // console.log("WebSocket connection closed");

        setTimeout(function () {
          connectWebSocket(otp);
        }, 5000);
      };

      conn.onmessage = function (e) {
        const eventData = JSON.parse(e.data);
        const event = Object.assign(new Event(), eventData);
        console.log("Received event:", event);
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

export function changeChatRoom(username) {
  let changeEvent = new ChangeChatRoomEvent(username);
  sendEvent("change_room", changeEvent);
}

window.addEventListener("load", function () {
  const user = localStorage.getItem("user");
  if (user) {
    const userObj = JSON.parse(user);
    if (userObj.otp !== "") {
      // console.log("Reconnecting to websocket");
      connectWebSocket(userObj.otp);
    }
  }
});
