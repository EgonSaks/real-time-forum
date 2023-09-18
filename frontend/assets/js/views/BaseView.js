import { fetchChats } from "../api/usersChatsAPI.js";
import {
  createChatContainer,
  getMessengerVisibility,
} from "../components/chat.js";
import { createNavbar } from "../components/navbar.js";
import { navigateTo } from "../router/router.js";
import { isLoggedIn } from "../utils/auth.js";
import { HomeView } from "../views/HomeView.js";
import { Login } from "../views/Login.js";
import { PostView } from "../views/PostView.js";
import { Register } from "../views/Register.js";

let navbar = null;
let chatContainer = null;

async function populateChatContainer() {
  if (!chatContainer) {
    const chats = await fetchChats();
    chatContainer = await createChatContainer(chats);
  }
}

function populateNavbar(currentUser) {
  navbar = createNavbar(currentUser);
}

export async function createBaseView(params, matchedView) {
  const appContainer = document.querySelector("#app");
  appContainer.innerHTML = "";

  const currentUser = await isLoggedIn();
  const userLoggedIn = currentUser && currentUser.isLoggedIn;
  const messengerVisible = getMessengerVisibility();

  if (!userLoggedIn) {
    if (
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/register"
    ) {
      navigateTo("/login");
      return;
    }
  } else {
    if (
      window.location.pathname === "/login" ||
      window.location.pathname === "/register"
    ) {
      navigateTo("/");
      return;
    }

    populateNavbar(currentUser);
    await populateChatContainer();
  }

  if (userLoggedIn && (matchedView === HomeView || matchedView === PostView)) {
    matchedView(params, messengerVisible);
    appContainer.append(navbar, chatContainer);
  } else if (
    !userLoggedIn &&
    (matchedView === Register || matchedView === Login)
  ) {
    matchedView();
  }
}
