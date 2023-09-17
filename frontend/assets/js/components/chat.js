import { formatDateTime, formatLastSeen } from "../utils/timeConverter.js";
import { currentUser, sendEvent } from "../websocket/websocket.js";

let messengerVisible = false;
let visibleMessengerUser = null;
let lastMessageID = null;

let totalMessagesCount = 0;
let limit = 10;
let offset = 0;

export function getLastMessageID(messageID) {
  lastMessageID = messageID;
}

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

    const name = document.createElement("div");
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

    const notification = createNotification(user.unread_messages);

    userDiv.append(name, notification, lastSeen);
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
  visibleMessengerUser = receiver.username;

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

  chatMessages.removeEventListener("scroll", chatScroll);
  chatMessages.addEventListener("scroll", chatScroll, 100);

  const contentContainer = document.getElementById("content-container");
  contentContainer.style.width = "53%";

  const chats = document.querySelector(".chats");
  chats.style.width = "40%";

  const chatsContainer = document.querySelector(".chats-container");
  chatsContainer.style.width = "45%";

  messengerBody.style.display = "block";
  inputContainer.style.display = "flex";
  messengerHeader.style.borderBottom = "1px solid #000";
  inputContainer.style.borderTop = "1px solid #000";
}

async function chatScroll() {
  const chatMessages = document.querySelector(".chat-messages");
  const scrollPosition = chatMessages.scrollTop;

  if (scrollPosition === 0 && offset < totalMessagesCount) {
    const remainingMessagesCount = totalMessagesCount - offset;
    const messagesToRetrieve = Math.min(limit, remainingMessagesCount);

    offset += messagesToRetrieve;

    const requestMoreMessages = {
      extraMessages: true,
      sender: currentUser.username,
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
  contentContainer.style.width = "73%";

  const chats = document.querySelector(".chats");
  chats.style.width = "20%";

  const chatsContainer = document.querySelector(".chats-container");
  chatsContainer.style.width = "90%";
}

async function sendMessage() {
  const messageInput = document.querySelector(".messenger-input");
  const recipient = messageInput.getAttribute("data-recipient");
  const message = messageInput.value.trim();

  if (message !== null && message !== "") {
    let outgoingMessage = {
      message,
      sender: currentUser.username,
      receiver: recipient,
    };
    sendEvent("send_message", outgoingMessage);
    messageInput.value = "";
  }
}

export async function appendChatMessage(messageElement, prepend = false) {
  if (!currentUser || !currentUser.username) {
    return;
  }

  if (
    visibleMessengerUser !== messageElement.sender &&
    visibleMessengerUser !== messageElement.receiver
  ) {
    return;
  }

  if (!prepend) {
    offset++;
  }

  const chatMessages = document.querySelector(".chat-messages");

  const isScrolledToBottom =
    chatMessages.scrollHeight - chatMessages.clientHeight <=
    chatMessages.scrollTop + 1;

  const isCurrentUserSender = messageElement.sender === currentUser.username;

  const oldScrollHeight = chatMessages.scrollHeight;
  const oldScrollTop = chatMessages.scrollTop;

  const messageContainer = document.createElement("div");
  const date = new Date(messageElement.sent_at);
  const formattedMsg = `${messageElement.message}`;
  const message = document.createElement("p");

  message.classList.add("message");
  message.textContent = formattedMsg;

  const timeContainer = document.createElement("div");
  timeContainer.classList.add("time-container");
  timeContainer.textContent = formatDateTime(date);

  const messageContent = document.createElement("div");
  messageContent.classList.add("message-content");
  messageContent.dataset.id = messageElement.id;
  messageContent.append(message);
  messageContainer.append(messageContent, timeContainer);

  if (messageElement.sender === currentUser.username) {
    messageContainer.classList.add("sender-message");
  } else if (messageElement.receiver === currentUser.username) {
    messageContainer.classList.add("recipient-message");
  }

  if (prepend) {
    chatMessages.prepend(messageContainer);
  } else {
    chatMessages.append(messageContainer);
  }

  const newScrollHeight = chatMessages.scrollHeight;

  if (prepend) {
    chatMessages.scrollTop = oldScrollTop + (newScrollHeight - oldScrollHeight);
  } else {
    if (isScrolledToBottom || isCurrentUserSender) {
      chatMessages.scrollTop = newScrollHeight;
    }
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

  messengerInput.addEventListener("focus", function () {
    removeNotificationElement();
  });

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

export function createNotification(unreadMessages) {
  const notification = document.createElement("div");
  notification.className = "notification";

  if (unreadMessages > 0) {
    const count = document.createElement("span");
    count.className = "count";
    count.textContent = unreadMessages > 9 ? "9+" : unreadMessages.toString();
    notification.append(count);
  }

  return notification;
}

function removeNotificationElement() {
  const activeChatName = document.querySelector(".messenger-name").textContent;
  const notificationElement = document.querySelector(
    `[data-username="${activeChatName}"]`
  ).nextElementSibling;

  if (activeChatName && notificationElement) {
    sendEvent("update_read_status", lastMessageID);
    notificationElement.remove();
  }
}
