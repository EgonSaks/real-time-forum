import {
  appendChatMessage,
  changeChat,
  createChats,
  messagesCount,
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

// routeEvent is called when a message is received from the server
function routeEvent(msg, currentUser) {
  switch (msg.type) {
    case "new_message":
      const message = msg.payload;
      console.log("new_message:", message);
      appendChatMessage(message);
      break;
    case "past_messages":
      const messages = msg.payload;
      if (messages.messages) {
        messages.messages.reverse().forEach((message) => {
          appendChatMessage(message, true);
        });
      }
      break;
    case "chat_list_update":
      const chatToUpdate = msg.payload;
      const updatedChats = chatToUpdate.filter(
        (item) => item.User.username !== currentUser.username
      );
      const usersList = updatedChats.map((item) => item.User);
      createChats(usersList);
      break;
    case "change_chat":
      const chat = msg.payload;
      changeChat(chat);
      if (chat.count_of_messages > 0) {
        const countOfMessages = chat.count_of_messages;
        messagesCount(countOfMessages);
      }
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
