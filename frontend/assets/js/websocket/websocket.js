import { fetchChats } from "../api/usersChatsAPI.js";
import {
  appendChatMessage,
  changeChat,
  createChats,
  getLastMessageID,
  messagesCount,
  updateUserStatus,
} from "../components/chat.js";

import { config } from "../config/config.js";

let ws;

export function connectWebSocket() {
  if (window["WebSocket"]) {
    try {
      const url = `ws://${window.location.hostname}:${config.wsPort}/ws`;
      ws = new WebSocket(url);

      ws.onopen = function (message) {};

      ws.onmessage = function (message) {
        const data = JSON.parse(message.data);
        routeEvent(data);
      };

      ws.onclose = function (message) {};

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

// routeEvent is called when a message is received from the server
async function routeEvent(msg) {
  switch (msg.type) {
    case "new_message":
      const message = msg.payload;
      getLastMessageID(message.id);
      appendChatMessage(message);
      break;
    case "past_messages":
      const messages = msg.payload;
      if (messages.messages) {
        messages.messages.reverse().forEach((message) => {
          appendChatMessage(message, true);
        });
      }
      if (messages.count_of_messages > 0) {
        const countOfMessages = messages.count_of_messages;
        messagesCount(countOfMessages);
      }
      break;
    case "chat_list_update":
      const chats = await fetchChats();
      createChats(chats);
      break;
    case "change_chat":
      const chat = msg.payload;
      changeChat(chat);
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
  connectWebSocket();
});
