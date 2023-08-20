import {
  appendChatMessage,
  getMessengerVisibility,
  hideMessenger,
  showMessenger,
  updateUserStatus,
} from "../components/chat.js";
import { config } from "../config/config.js";
import { isLoggedIn } from "../utils/auth.js";

let ws;
let activeChatUser = null;

export function connectWebSocket(user) {
  if (window["WebSocket"]) {
    try {
      const url = `ws://${window.location.hostname}:${config.wsPort}/ws`;
      ws = new WebSocket(url);

      ws.onopen = function (message) {
        console.log("Connection established!");
        updateUserStatus(user.username, true);
      };

      ws.onmessage = function (message) {
        const data = JSON.parse(message.data);
        routeEvent(data);
      };

      ws.onclose = function (message) {
        console.log("WebSocket closed unexpectedly");
        updateUserStatus(user.username, false);
      };

      return ws;
    } catch (error) {
      console.error("WebSocket connection could not be established:", error);
    }
  } else {
    alert("WebSockets are not supported in this browser.");
  }
}

export function sendEvent(eventType, payload) {
  const msg = { type: eventType, payload };
  ws.send(JSON.stringify(msg));
}

function routeEvent(msg) {
  switch (msg.type) {
    case "new_message":
      const message = msg.payload;

      if (message.messages) {
        message.messages.forEach((message) => {
          appendChatMessage(message);
        });
      } else {
        const user = isLoggedIn();
        if (
          (message.sender === user.username &&
            message.receiver === activeChatUser) ||
          (message.receiver === user.username &&
            message.sender === activeChatUser)
        ) {
          appendChatMessage(message);
        }
      }
      break;
    default:
      alert("unsupported message type");
      break;
  }
}

export function changeChat(user) {
  if (activeChatUser !== user.username) {
    activeChatUser = user.username;

    if (getMessengerVisibility()) {
      hideMessenger();
    }
    showMessenger(user);

    const messageInput = document.querySelector(".messenger-input");
    messageInput.setAttribute("data-recipient", user.username);
    const username = { username: user.username };
    console.log(username);
    sendEvent("change_chat", username);
  }
}

export function closeWebSocket() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close();
  }
}

window.addEventListener("DOMContentLoaded", function () {
  const user = localStorage.getItem("user");
  if (user) {
    const userObj = JSON.parse(user);
    if (userObj !== "") {
      connectWebSocket(userObj);
    }
  }
});
