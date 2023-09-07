// import { fetchChats } from "../api/usersChatsAPI.js";
import { isLoggedIn } from "../utils/auth.js";
import { formatLastSeen } from "../utils/timeConverter.js";
import { sendEvent } from "../websocket/websocket.js";

let messengerVisible = false;
let previousDate = null;

let totalMessagesCount = 0;
let limit = 10;
let offset = 0;

export function messagesCount(totalMessages) {
  totalMessagesCount = totalMessages;
}

export function getMessengerVisibility() {
  return messengerVisible;
}

export function updateUserStatus(username, online, lastSeen) {
  const onlineStatus = online ? "online" : "offline";

  // Updating chat elements
  const chatsContainer = document.querySelector(".chats-container");
  if (chatsContainer) {
    const chats = chatsContainer.querySelectorAll(".chat");
    chats.forEach((chat) => {
      const name = chat.querySelector(".chat-name");
      if (name.getAttribute("data-username") === username) {
        const status = chat.querySelector(".chat-status");
        status.classList.remove("offline", "online");
        status.classList.add(onlineStatus);
        status.textContent = onlineStatus;
        const lastSeenElement = chat.querySelector(".chat-last-seen");

        // Display last seen time only if the user is offline
        lastSeenElement.textContent = online
          ? ""
          : formatLastSeen(lastSeen) || "";
      }
    });
  }

  // Updating messenger elements
  const messenger = document.querySelector(".messenger");
  if (messenger) {
    const messengerName = messenger.querySelector(".messenger-name");
    if (messengerName.textContent === username) {
      const messengerStatus = messenger.querySelector(".messenger-status");
      messengerStatus.classList.remove("offline", "online");
      messengerStatus.classList.add(onlineStatus);
      messengerStatus.textContent = onlineStatus;
      const messengerLastSeen = messenger.querySelector(".messenger-last-seen");

      // Display last seen time only if the user is offline
      messengerLastSeen.textContent = online
        ? ""
        : formatLastSeen(lastSeen) || "";
    }
  }
}

export function createChats(users) {
  let chatsContainer = document.querySelector(".chats-container");

  if (chatsContainer) {
    chatsContainer.innerHTML = "";
  } else {
    chatsContainer = document.createElement("div");
    chatsContainer.classList.add("chats-container");
  }

  const header = document.createElement("div");
  header.classList.add("chats-header");
  header.textContent = "Messenger";
  chatsContainer.append(header);

  if (users === null || users.length === 0) {
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
    name.textContent = user.username || "Anonymous";
    name.setAttribute("data-username", user.username);

    const lastSeen = document.createElement("p");
    lastSeen.classList.add("chat-last-seen");
    lastSeen.textContent = user.last_seen || "";

    const status = document.createElement("p");
    status.classList.add(
      "chat-status",
      user.status === "online" ? "online" : "offline"
    );
    status.classList.add("chat-status", "online");
    status.textContent = user.status || "offline";

    userDiv.append(name, lastSeen);
    chat.append(userDiv, status);

    chatsContainer.append(chat);

    chat.addEventListener("click", () => {
      const username = { username: user.username };
      sendEvent("change_chat", username);
    });
  });

  return chatsContainer;
}

export function changeChat(receiver) {
  offset = 0;
  totalMessagesCount = 0;

  if (getMessengerVisibility()) {
    hideMessenger();
  }
  showMessenger(receiver);

  const messageInput = document.querySelector(".messenger-input");
  messageInput.setAttribute("data-recipient", receiver.username);
}

export function showMessenger(receiver) {
  const messenger = document.querySelector(".messenger");
  const messengerHeader = messenger.querySelector(".messenger-header");
  const name = messengerHeader.querySelector(".messenger-name");
  const lastSeen = messengerHeader.querySelector(".messenger-last-seen");
  const status = messengerHeader.querySelector(".messenger-status");

  name.textContent = receiver.username || "Anonymous";
  lastSeen.textContent = receiver.last_seen || "";

  const onlineStatus = receiver.status === "online" ? "online" : "offline";
  status.classList.remove("offline", "online");
  status.classList.add(onlineStatus);
  status.textContent = onlineStatus;

  messengerVisible = true;
  messenger.classList.remove("messenger-hidden");

  const messengerBody = messenger.querySelector(".messenger-body");
  const inputContainer = messenger.querySelector(".input-container");
  const chatMessages = messenger.querySelector(".chat-messages");

  messenger.style.display = "block";
  messengerHeader.style.display = "block";
  messengerBody.style.display = "block";
  inputContainer.style.display = "flex";
  messengerHeader.style.borderBottom = "1px solid #000";
  inputContainer.style.borderTop = "1px solid #000";

  messengerBody.querySelector(".chat-messages").textContent = "";

  chatMessages.addEventListener("scroll", chatScroll, 100);

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

function chatScroll() {
  const chatMessages = document.querySelector(".chat-messages");
  const scrollPosition = chatMessages.scrollTop;

  if (scrollPosition === 0 && offset < totalMessagesCount) {
    const user = isLoggedIn();

    const remainingMessagesCount = totalMessagesCount - offset;
    const messagesToRetrieve = Math.min(limit, remainingMessagesCount);

    offset += messagesToRetrieve;

    const requestMoreMessages = {
      extraMessages: true,
      sender: user.username,
      receiver: document.querySelector(".messenger-name").textContent,
      prepend: true,
      offset: offset,
      limit: messagesToRetrieve,
    };

    sendEvent("past_messages", requestMoreMessages);
  }
}

export function hideMessenger() {
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
  const recipient = messageInput.getAttribute("data-recipient");
  const message = messageInput.value.trim();

  if (message !== null && message !== "") {
    const user = isLoggedIn();
    let outgoingMessage = {
      message,
      sender: user.username,
      receiver: recipient,
    };
    sendEvent("send_message", outgoingMessage);
    messageInput.value = "";
  }
}

export function appendChatMessage(messageElement, prepend = false) {
  if (!prepend) {
    offset++;
  }
  const chatMessages = document.querySelector(".chat-messages");
  const messageContainer = document.createElement("div");

  const date = new Date(messageElement.sent_at);
  const formattedMsg = `${messageElement.message}`;

  const message = document.createElement("p");
  message.classList.add("message");
  message.textContent = formattedMsg;

  const timeOptions = { hour: "numeric", minute: "numeric" };
  const timeString = date.toLocaleTimeString([], timeOptions);

  const timeContainer = document.createElement("div");
  timeContainer.classList.add("time-container");
  timeContainer.textContent = timeString;

  const dateOptions = { year: "numeric", month: "long", day: "numeric" };
  const dateString = date.toLocaleDateString([], dateOptions);

  if (dateString !== previousDate || previousDate === null) {
    const dateContainer = document.createElement("div");
    dateContainer.classList.add("date-container");
    dateContainer.textContent = dateString;

    if (prepend) {
      chatMessages.prepend(dateContainer);
    } else {
      chatMessages.appendChild(dateContainer);
    }

    previousDate = dateString;
  }

  const dateContainer = document.createElement("div");
  dateContainer.classList.add("date-container");
  dateContainer.textContent = dateString;

  const messageContent = document.createElement("div");
  messageContent.classList.add("message-content");
  messageContent.append(message);
  messageContainer.append(messageContent, timeContainer);

  const user = isLoggedIn();

  if (messageElement.sender === user.username) {
    messageContainer.classList.add("sender-message");
  } else if (messageElement.receiver === user.username) {
    messageContainer.classList.add("recipient-message");
  }

  const oldScrollHeight = chatMessages.scrollHeight;

  const oldScrollTop = chatMessages.scrollTop;

  if (prepend) {
    chatMessages.prepend(messageContainer);
  } else {
    chatMessages.appendChild(messageContainer);
  }

  const newScrollHeight = chatMessages.scrollHeight;
  if (prepend) {
    chatMessages.scrollTop = oldScrollTop + (newScrollHeight - oldScrollHeight);
  } else {
    chatMessages.scrollTop = newScrollHeight;
  }
}

export function createMessenger() {
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

  const closeButton = document.createElement("closeButton");
  closeButton.classList.add("messenger-close-button");
  closeButton.textContent = "x";
  closeButton.addEventListener("click", hideMessenger);

  nameWithLastSeen.append(name, lastSeen, closeButton);

  const status = document.createElement("p");
  status.classList.add("messenger-status");
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
      sendButton.classList.add("send-button-active");
    } else {
      sendButton.classList.remove("send-button-active");
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

  sendButton.addEventListener("click", function () {
    sendMessage();
  });

  inputContainer.append(messengerInput, sendButton);

  messenger.append(messengerHeader, messengerBody, inputContainer);

  messengerHeader.addEventListener("click", hideMessenger);

  return messenger;
}

export async function createChatContainer(users) {
  const chatsContainer = document.createElement("div");
  chatsContainer.classList.add("chats");

  const chat = createChats(users);
  const messenger = createMessenger();

  chatsContainer.append(chat, messenger);

  return chatsContainer;
}
