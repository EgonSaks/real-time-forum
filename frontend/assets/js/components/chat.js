import { isLoggedIn } from "../utils/auth.js";
import {
  ChangeChat,
  SendMessageEvent,
  sendEvent,
} from "../websocket/websocket.js";
let recipient = null;
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

  if (users.length === 0) {
    const noUsersText = document.createElement("p");
    noUsersText.classList.add("no-users-text");
    noUsersText.textContent = "Wait for users to come online";
    chatsContainer.append(noUsersText);
    return chatsContainer;
  }

  users.forEach((user) => {
    const chat = document.createElement("div");
    chat.classList.add("chat");

    const userDiv = document.createElement("div");
    userDiv.classList.add("chat-name-with-last-seen");

    const name = document.createElement("h4");
    name.classList.add("chat-name");
    name.textContent = user.username;

    const lastSeen = document.createElement("p");
    lastSeen.classList.add("chat-last-seen");
    lastSeen.textContent = "user.last_seen";

    const status = document.createElement("p");
    status.classList.add(
      "chat-status",
      user.status === "online" ? "online" : "offline"
    );
    status.classList.add("chat-status", "online");
    status.textContent = user.status;

    userDiv.append(name, lastSeen);
    chat.append(userDiv, status);

    chatsContainer.append(chat);

    chat.addEventListener("click", () => {
      ChangeChat(user.username);
      showMessenger(user);
      console.log("clicked on chat");
      console.log("showMessenger user",user);
      console.log("ChangeChat user.username",user.username);
    });
  });

  return chatsContainer;
}

function showMessenger(user) {
  if (recipient === user) {
    return;
  }

  recipient = user;

  const messenger = document.querySelector(".messenger");
  const messengerHeader = messenger.querySelector(".messenger-header");
  const nameElement = messengerHeader.querySelector(".messenger-name");
  const lastSeenElement = messengerHeader.querySelector(".messenger-last-seen");
  const statusElement = messengerHeader.querySelector(".messenger-status");

  nameElement.textContent = user.username;
  lastSeenElement.textContent = "user.last_seen";
  statusElement.textContent = "user.status";
  statusElement.classList.remove("offline", "online");

  messengerVisible = true;
  messenger.classList.remove("messenger-hidden");

  const messengerBody = messenger.querySelector(".messenger-body");
  const inputContainer = messenger.querySelector(".input-container");

  messenger.style.display = "block";
  messengerHeader.style.display = "block";
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
  const messengerHeader = messenger.querySelector(".messenger-header");
  const messengerBody = messenger.querySelector(".messenger-body");
  const inputContainer = messenger.querySelector(".input-container");

  messenger.style.display = "none";
  messengerHeader.style.display = "none";
  messengerBody.style.display = "none";
  inputContainer.style.display = "none";
  messengerHeader.style.borderBottom = "none";
  inputContainer.style.borderTop = "none";

  recipient = null;
  messengerVisible = false;
  messenger.classList.add("messenger-hidden");

  const contentContainer = document.getElementById("content-container");
  contentContainer.style.width = "80%";

  const chats = document.querySelector(".chats");
  chats.style.width = "20%";

  const chatsContainer = document.querySelector(".chats-container");
  chatsContainer.style.width = "90%";
}

function sendMessage(user) {
  const messageInput = document.querySelector(".messenger-input");
  const message = messageInput.value.trim();
  if (message !== null && message !== "") {
    
    console.log("Sending message", message);
    console.log("From", user.username);
    console.log("To", recipient.username);
    console.log("Logged in user", isLoggedIn().username);

    let outgoingEvent = new SendMessageEvent(
      message,
      user.username,
      recipient.username
    );
    sendEvent("send_message", outgoingEvent);
    messageInput.value = "";
  }
  showMessenger(recipient);
}

export function appendChatMessage(messageElement) {
  const chatMessages = document.querySelector(".chat-messages");
  const messageContainer = document.createElement("div");

  const date = new Date(messageElement.sent);
  const formattedMsg = `${messageElement.message}`;

  const message = document.createElement("p");
  message.classList.add("message");
  message.textContent = formattedMsg;

  const dateContainer = document.createElement("div");
  dateContainer.classList.add("date-container");
  dateContainer.textContent = date.toLocaleString();

  const messageContent = document.createElement("div");
  messageContent.classList.add("message-content");
  messageContent.appendChild(message);

  messageContainer.appendChild(messageContent);
  messageContainer.appendChild(dateContainer);

  const user = isLoggedIn();

  if (messageElement.from === user.username) {
    console.log("Message from user", user.username);
    messageContainer.classList.add("sender-message");
  } else if (messageElement.to === user.username) {
    console.log("Message to user", user.username);
    messageContainer.classList.add("recipient-message");
  }

  chatMessages.appendChild(messageContainer);

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

export function createMessenger(user) {
  console.log("Creating messenger for " + user.username + ".");
  const messenger = document.createElement("div");

  messenger.classList.add("messenger");

  const messengerHeader = document.createElement("div");
  messengerHeader.classList.add("messenger-header");

  const nameWithLastSeen = document.createElement("div");
  nameWithLastSeen.classList.add("messenger-name-with-last-seen");

  const name = document.createElement("h4");
  name.classList.add("messenger-name");
  name.textContent = "";

  const lastSeen = document.createElement("p");
  lastSeen.classList.add("messenger-last-seen");
  lastSeen.textContent = "";

  nameWithLastSeen.append(name, lastSeen);

  const status = document.createElement("p");
  status.classList.add("messenger-status", "online");
  status.textContent = "";

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
      sendMessage(user);
    }
    handleTyping();
  });

  messengerInput.addEventListener("input", handleTyping);

  const sendButton = document.createElement("button");
  sendButton.classList.add("message-send-button");
  sendButton.textContent = "Send";

  sendButton.addEventListener("click", function () {
    sendMessage(user);
  });

  inputContainer.append(messengerInput, sendButton);

  messenger.append(messengerHeader, messengerBody, inputContainer);

  messengerHeader.addEventListener("click", hideMessenger);

  return messenger;
}

export function createChatContainer(users) {
  const chatsContainer = document.createElement("div");
  chatsContainer.classList.add("chats");

  const user = isLoggedIn();
  console.log("Logged in as " + user.username + ".");
  const chat = createChats(users);
  const messenger = createMessenger(user);

  chatsContainer.append(chat, messenger);

  return chatsContainer;
}
