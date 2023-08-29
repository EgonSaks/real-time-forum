import {
  appendChatMessage,
  changeChat,
  createChats,
  updateUserStatus,
} from "../components/chat.js";

import { config } from "../config/config.js";

let ws;

export function connectWebSocket(currentUser) {
  if (window["WebSocket"]) {
    try {
      const url = `ws://${window.location.hostname}:${config.wsPort}/ws`;
      ws = new WebSocket(url);

      ws.onopen = function (message) {
        console.log("Connection established!");
      };

      ws.onmessage = function (message) {
        const data = JSON.parse(message.data);
        // console.log("Received WebSocket data:", data);
        routeEvent(data, currentUser);
      };

      ws.onclose = function (message) {
        console.log("WebSocket closed unexpectedly");
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
  console.log("Sending event:", msg);
  ws.send(JSON.stringify(msg));
}

function routeEvent(msg, currentUser) {
  switch (msg.type) {
    case "new_message":
      const message = msg.payload;
      if (message.messages) {
        message.messages.forEach((message) => {
          appendChatMessage(message);
        });
      } else {
        appendChatMessage(message);
      }
      break;
    case "chat_list_update":
      const chatToUpdate = msg.payload;
      console.log("chatToUpdate", chatToUpdate);
      const updatedChats = chatToUpdate.filter((item) => item.User.username !== currentUser.username);
      const usersList = updatedChats.map((item) => item.User);
      console.log("usersList", usersList);
      createChats(usersList);
      break;
    case "change_chat":
      changeChat(msg.payload);
      break;
    case "status_update":
      const usersToUpdate = msg.payload;
      usersToUpdate.forEach((user) => {
        const { username, status, last_seen } = user;
        updateUserStatus(username, status, last_seen);
      });
      break;
    default:
      alert("unsupported message type");
      break;
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
    const currentUser = JSON.parse(user);
    if (currentUser !== "") {
      connectWebSocket(currentUser);
    }
  }
});
