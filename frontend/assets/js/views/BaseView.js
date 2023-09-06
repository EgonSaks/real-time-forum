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

const chatContainerPromise = createChatContainer();

export async function createBaseView(params, matchedView) {
  const appContainer = document.querySelector("#app");
  appContainer.innerHTML = "";

  const currentUser = isLoggedIn();
  const messengerVisible = getMessengerVisibility();
  const userLoggedIn = currentUser && currentUser.isLoggedIn;
  const navbar = createNavbar(currentUser);

  if (
    !userLoggedIn &&
    window.location.pathname !== "/login" &&
    window.location.pathname !== "/register"
  ) {
    navigateTo("/login");
    return;
  }

  if (
    userLoggedIn &&
    (window.location.pathname === "/login" ||
      window.location.pathname === "/register")
  ) {
    navigateTo("/");
    return;
  }

  if (userLoggedIn) {
    if (matchedView === HomeView || matchedView === PostView) {
      const chatContainer = await chatContainerPromise
      matchedView(params, messengerVisible);
      appContainer.append(navbar, chatContainer);
    }
  } else {
    if (matchedView === Register || matchedView === Login) {
      matchedView();
    }
  }
}
