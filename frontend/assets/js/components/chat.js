import { data } from "./dummyData.js";
let currentUser = null;
let messengerVisible = false;

export function getMessengerVisibility() {
  return messengerVisible;
}

export function createChats(users) {
  // Create the chats container
  const chatsContainer = document.createElement("div");
  chatsContainer.classList.add("chats-container");

  // Create the header element for the chats
  const header = document.createElement("div");
  header.classList.add("chats-header");
  header.textContent = "Messenger";
  chatsContainer.append(header);

  // Create the Online/Offline users header
  if (Object.keys(users).length === 0) {
    const noUsersText = document.createElement("p");
    noUsersText.classList.add("no-users-text");
    noUsersText.textContent = "Wait for users to come online";
    chatsContainer.append(noUsersText);
    return chatsContainer;
  }

  // Create the Online/Offline users header
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
  // If the messenger is already visible and the user is the same, do nothing
  if (currentUser === user) {
    return;
  }

  // If the messenger is already visible and the user is different, hide the messenger
  currentUser = user;

  // Get the messenger and its header
  const messenger = document.querySelector(".messenger");
  const messengerHeader = messenger.querySelector(".messenger-header");
  const nameElement = messengerHeader.querySelector(".messenger-name");
  const lastSeenElement = messengerHeader.querySelector(".messenger-last-seen");
  const statusElement = messengerHeader.querySelector(".messenger-status");

  // Update messenger header with user's information
  nameElement.textContent = user.name;
  lastSeenElement.textContent = user.last_seen;
  statusElement.textContent = user.status;
  statusElement.classList.remove("offline", "online");
  statusElement.classList.add(user.status.toLowerCase());

  // Show the messenger, messenger-header, body, and input-container
  messengerVisible = true;
  messenger.classList.remove("messenger-hidden");
  messenger.style.height = "30vh";

  // Get the messenger body and input-container
  const messengerBody = messenger.querySelector(".messenger-body");
  const inputContainer = messenger.querySelector(".input-container");
  messengerBody.style.display = "block";
  inputContainer.style.display = "flex";
  messengerHeader.style.borderBottom = "1px solid #000";
  inputContainer.style.borderTop = "1px solid #000";

  // Clear previous messages when changing users
  messengerBody.querySelector(".chat-messages").textContent = "";

  // Adjust the content-container width to accommodate the messenger
  const contentContainer = document.getElementById("content-container");
  contentContainer.style.width = "60%";

  // Adjust the chats width to accommodate the messenger
  const chats = document.querySelector(".chats");
  chats.style.width = "40%";

  // Adjust the chats-container width to accommodate the messenger
  const chatsContainer = document.querySelector(".chats-container");
  chatsContainer.style.width = "45%";

  // Show the messenger content
  messengerBody.style.display = "block";
  inputContainer.style.display = "flex";
  messengerHeader.style.borderBottom = "1px solid #000";
  inputContainer.style.borderTop = "1px solid #000";
}

function hideMessenger() {
  // Hide the messenger
  const messenger = document.querySelector(".messenger");
  messenger.style.height = "";

  // Get the messenger body and input-container
  const messengerHeader = messenger.querySelector(".messenger-header");
  const messengerBody = messenger.querySelector(".messenger-body");
  const inputContainer = messenger.querySelector(".input-container");

  // Hide the messenger content
  messengerBody.style.display = "none";
  inputContainer.style.display = "none";
  messengerHeader.style.borderBottom = "none";
  inputContainer.style.borderTop = "none";

  // Clear the currentUser variable and update the visibility flag
  currentUser = null;
  messengerVisible = false;

  // Add the "messenger-hidden" class to hide the messenger
  messenger.classList.add("messenger-hidden");

  // Adjust the content-container width to remove the messenger
  const contentContainer = document.getElementById("content-container");
  contentContainer.style.width = "80%";

  // Adjust the chats width to remove the messenger
  const chats = document.querySelector(".chats");
  chats.style.width = "20%";

  // Adjust the chats-container width to remove the messenger
  const chatsContainer = document.querySelector(".chats-container");
  chatsContainer.style.width = "90%";
}

function sendMessage() {
  // Get the message from the input
  const messageInput = document.querySelector(".messenger-input");
  const message = messageInput.value.trim();
  if (message !== "") {
    // Get the chat messages container
    const chatMessages = document.querySelector(".chat-messages");

    // Create a container for the message
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("message-container");

    // Create the message element
    const messageElement = document.createElement("p");
    messageElement.classList.add("message");
    messageElement.textContent = message;

    // Append the message to the container and the container to the chat messages
    messageContainer.appendChild(messageElement);
    chatMessages.appendChild(messageContainer);

    console.log("Sending message:", message);
    // Clear the input
    messageInput.value = "";
  }

  showMessenger(currentUser);
}

export function createMessenger(user) {
  // Create the messenger
  const messenger = document.createElement("div");
  messenger.classList.add("messenger", "messenger-hidden");

  // Create the messenger header
  const messengerHeader = document.createElement("div");
  messengerHeader.classList.add("messenger-header");

  // Create the name and last_seen elements
  const nameWithLastSeen = document.createElement("div");
  nameWithLastSeen.classList.add("messenger-name-with-last-seen");

  const name = document.createElement("h4");
  name.classList.add("messenger-name");
  name.textContent = "John Doe";

  const lastSeen = document.createElement("p");
  lastSeen.classList.add("messenger-last-seen");
  lastSeen.textContent = "";

  nameWithLastSeen.append(name, lastSeen);

  // Create the status element
  const status = document.createElement("p");
  status.classList.add("messenger-status", "online");
  status.textContent = "online";

  messengerHeader.append(nameWithLastSeen, status);

  // Create the messenger body
  const messengerBody = document.createElement("div");
  messengerBody.classList.add("messenger-body");

  // Create the chat messages container
  const chatMessages = document.createElement("p");
  chatMessages.classList.add("chat-messages");
  messengerBody.append(chatMessages);

  // Create the input container
  const inputContainer = document.createElement("div");
  inputContainer.classList.add("input-container");

  // Create the messenger input
  const messengerInput = document.createElement("textarea");
  messengerInput.setAttribute("rows", "3");
  messengerInput.setAttribute("placeholder", "Type a message...");
  messengerInput.classList.add("messenger-input");

  // Add a keydown event listener to the messenger input
  messengerInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.shiftKey) {
      messengerInput.value += "\n";
    } else if (e.key === "Enter") {
      e.preventDefault();

      sendMessage();
    }
  });

  // Create the send button
  const sendButton = document.createElement("button");
  sendButton.classList.add("message-send-button");
  sendButton.textContent = "Send";
  sendButton.addEventListener("click", sendMessage);

  inputContainer.append(messengerInput, sendButton);

  messenger.append(messengerHeader, messengerBody, inputContainer);

  // Add a click event listener to the messenger header to hide the messenger
  messengerHeader.addEventListener("click", hideMessenger);

  return messenger;
}

export function createChatContainer() {
  // Create the chats container
  const chatsContainer = document.createElement("div");
  chatsContainer.classList.add("chats");

  const users = data();

  const chats = createChats(users);

  const messenger = createMessenger();

  chatsContainer.append(messenger, chats);

  return chatsContainer;
}
