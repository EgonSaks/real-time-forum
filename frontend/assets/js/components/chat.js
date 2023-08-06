import { sendEvent } from "../websocket/websocket.js";
import { data } from "./dummyData.js";
let currentUser = null;
let messengerVisible = false;

export function getMessengerVisibility() {
  return messengerVisible;
}

export function createChats(users) {
  const chatsContainer = document.createElement("div");
  chatsContainer.classList.add("chats-container");

  const header = document.createElement("div");
  header.classList.add("chats-header");
  header.textContent = "Messenger";
  chatsContainer.append(header);

  if (Object.keys(users).length === 0) {
    const noUsersText = document.createElement("p");
    noUsersText.classList.add("no-users-text");
    noUsersText.textContent = "Wait for users to come online";
    chatsContainer.append(noUsersText);
    return chatsContainer;
  }

  for (const user in users) {
    if (users.hasOwnProperty(user)) {
      const chat = document.createElement("div");
      chat.classList.add("chat");

      const userDiv = document.createElement("div");
      userDiv.classList.add("chat-name-with-last-seen");

      const name = document.createElement("h4");
      name.classList.add("chat-name");
      name.textContent = users[user].name;

      const lastSeen = document.createElement("p");
      lastSeen.classList.add("chat-last-seen");
      lastSeen.textContent = users[user].last_seen;

      const status = document.createElement("p");
      status.classList.add("chat-status", users[user].status.toLowerCase());
      status.textContent = users[user].status;

      userDiv.append(name, lastSeen);
      chat.append(userDiv, status);

      chatsContainer.append(chat);

      // Add a click event listener to the chat element
      chat.addEventListener("click", () => showMessenger(users[user]));
    }
  }

  return chatsContainer;
}

function showMessenger(user) {
  if (currentUser === user) {
    return;
  }

  currentUser = user;

  const messenger = document.querySelector(".messenger");
  const messengerHeader = messenger.querySelector(".messenger-header");
  const nameElement = messengerHeader.querySelector(".messenger-name");
  const lastSeenElement = messengerHeader.querySelector(".messenger-last-seen");
  const statusElement = messengerHeader.querySelector(".messenger-status");

  nameElement.textContent = user.name;
  lastSeenElement.textContent = user.last_seen;
  statusElement.textContent = user.status;
  statusElement.classList.remove("offline", "online");
  statusElement.classList.add(user.status.toLowerCase());

  messengerVisible = true;
  messenger.classList.remove("messenger-hidden");

  const messengerBody = messenger.querySelector(".messenger-body");
  const inputContainer = messenger.querySelector(".input-container");
  messengerBody.style.display = "block";
  inputContainer.style.display = "flex";
  messengerHeader.style.borderBottom = "1px solid #000";
  inputContainer.style.borderTop = "1px solid #000";

  messengerBody.querySelector(".chat-messages").textContent = "";

  const contentContainer = document.getElementById("content-container");
  contentContainer.style.width = "60%";

  const chats = document.querySelector(".chats");
  chats.style.width = "40%";

  const chatsContainer = document.querySelector(".chats-container");
  chatsContainer.style.width = "45%";

  messengerBody.style.display = "block";
  inputContainer.style.display = "flex";
  messengerHeader.style.borderBottom = "1px solid #000";
  inputContainer.style.borderTop = "1px solid #000";
}

function hideMessenger() {
  const messenger = document.querySelector(".messenger");
  messenger.style.height = "";

  const messengerHeader = messenger.querySelector(".messenger-header");
  const messengerBody = messenger.querySelector(".messenger-body");
  const inputContainer = messenger.querySelector(".input-container");

  messengerBody.style.display = "none";
  inputContainer.style.display = "none";
  messengerHeader.style.borderBottom = "none";
  inputContainer.style.borderTop = "none";

  currentUser = null;
  messengerVisible = false;

  messenger.classList.add("messenger-hidden");

  const contentContainer = document.getElementById("content-container");
  contentContainer.style.width = "80%";

  const chats = document.querySelector(".chats");
  chats.style.width = "20%";

  const chatsContainer = document.querySelector(".chats-container");
  chatsContainer.style.width = "90%";
}

function sendMessage() {
  const messageInput = document.querySelector(".messenger-input");
  const message = messageInput.value.trim();

  if (message !== null && message !== "") {
    const chatMessages = document.querySelector(".chat-messages");

    const messageContainer = document.createElement("div");
    messageContainer.classList.add("message-container");

    const messageElement = document.createElement("p");
    messageElement.classList.add("message");
    // messageElement.textContent = message;
    // messageElement.textContent = sendEvent("send_message", { message: message, from: "user" });
    messageElement.textContent = sendEvent("send_message", message);

    messageContainer.appendChild(messageElement);
    chatMessages.appendChild(messageContainer);

    console.log("Sending message:", message);
    messageInput.value = "";
  }
  showMessenger(currentUser);
}

export function createMessenger(user) {
  const messenger = document.createElement("div");
  messenger.classList.add("messenger", "messenger-hidden");
  messenger.classList.add("messenger");

  const messengerHeader = document.createElement("div");
  messengerHeader.classList.add("messenger-header");

  const nameWithLastSeen = document.createElement("div");
  nameWithLastSeen.classList.add("messenger-name-with-last-seen");

  const name = document.createElement("h4");
  name.classList.add("messenger-name");
  name.textContent = "John Doe";

  const lastSeen = document.createElement("p");
  lastSeen.classList.add("messenger-last-seen");
  lastSeen.textContent = "";

  nameWithLastSeen.append(name, lastSeen);

  const status = document.createElement("p");
  status.classList.add("messenger-status", "online");
  status.textContent = "online";

  messengerHeader.append(nameWithLastSeen, status);

  const messengerBody = document.createElement("div");
  messengerBody.classList.add("messenger-body");

  const chatMessages = document.createElement("p");
  chatMessages.classList.add("chat-messages");
  messengerBody.append(chatMessages);

  const inputContainer = document.createElement("div");
  inputContainer.classList.add("input-container");

  const messengerInput = document.createElement("textarea");
  messengerInput.setAttribute("placeholder", "Send a message");
  messengerInput.classList.add("messenger-input");

  function handleTyping() {
    const messengerInput = document.querySelector(".messenger-input");
    const sendButton = document.querySelector(".message-send-button");

    if (messengerInput.value.trim().length > 0) {
      sendButton.style.backgroundColor = "rgb(25, 195, 125)";
      sendButton.style.color = "#fff";
      sendButton.style.cursor = "pointer";
      sendButton.style.borderRadius = "0.3rem";
      sendButton.style.border = "none";
    } else {
      sendButton.style.backgroundColor = "";
      sendButton.style.color = "";
      sendButton.style.cursor = "";
      sendButton.style.borderRadius = "";
      sendButton.style.border = ""; //
    }
  }

  messengerInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.shiftKey) {
      messengerInput.value += "\n";
    } else if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
    handleTyping();
  });

  messengerInput.addEventListener("input", handleTyping);

  const sendButton = document.createElement("button");
  sendButton.classList.add("message-send-button");
  sendButton.textContent = "Send";
  sendButton.addEventListener("click", sendMessage);

  inputContainer.append(messengerInput, sendButton);

  messenger.append(messengerHeader, messengerBody, inputContainer);

  messengerHeader.addEventListener("click", hideMessenger);

  return messenger;
}

export async function createChatContainer() {
  const chatsContainer = document.createElement("div");
  chatsContainer.classList.add("chats");

  const users = data();

  const chats = createChats(users);

  const messenger = createMessenger();

  chatsContainer.append(messenger, chats);

  return chatsContainer;
}
