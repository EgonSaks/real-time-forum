import {
  appendChatMessage,
  getMessengerVisibility,
  hideMessenger,
  showMessenger,
} from "../components/chat.js";
import { isLoggedIn } from "../utils/auth.js";
let conn;
let activeChatUser = null;

class Event {
  constructor(type, payload) {
    this.type = type;
    this.payload = payload;
  }
}

export class SendMessageEvent {
  constructor(message, from, to) {
    this.message = message;
    this.from = from;
    this.to = to;
  }
}

export class NewMessageEvent {
  constructor(message, from, to, sent) {
    this.message = message;
    this.from = from;
    this.to = to;
    this.sent = sent;
  }
}

class ChangeChatEvent {
  constructor(name) {
    this.name = name;
  }
}

export function ChangeChat(user) {
  if (activeChatUser !== user.username) {
    activeChatUser = user.username;

    if (getMessengerVisibility()) {
      hideMessenger();
    }
    showMessenger(user);

    const messageInput = document.querySelector(".messenger-input");
    messageInput.setAttribute("data-recipient", user.username);

    let changeEvent = new ChangeChatEvent(user.username);
    sendEvent("change_chat", changeEvent);
  }
}

function routeEvent(event) {
  if (event.type === undefined) {
    alert("no 'type' field in event");
  }
  switch (event.type) {
    case "new_message":
      const messageEvent = Object.assign(new NewMessageEvent(), event.payload);
      const user = isLoggedIn();

      if (
        (messageEvent.from === user.username &&
          messageEvent.to === activeChatUser) ||
        (messageEvent.to === user.username &&
          messageEvent.from === activeChatUser)
      ) {
        appendChatMessage(messageEvent);
      }
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
    try {
      conn = new WebSocket("ws://localhost:8081/ws?otp=" + otp);

      conn.onopen = function (e) {};

      conn.onclose = function (e) {
        setTimeout(function () {
          connectWebSocket(otp);
        }, 5000);
      };

      conn.onmessage = function (e) {
        const eventData = JSON.parse(e.data);
        const event = Object.assign(new Event(), eventData);
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

window.addEventListener("DOMContentLoaded", function () {
  const user = localStorage.getItem("user");
  if (user) {
    const userObj = JSON.parse(user);
    if (userObj.otp !== "") {
      connectWebSocket(userObj.otp);
    }
  }
});
