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

export function createBaseView(params, matchedView) {
  const appContainer = document.querySelector("#app");
  appContainer.innerHTML = "";

  const user = isLoggedIn();
  const chatContainer = createChatContainer();
  const navbar = createNavbar(user);

  const messengerVisible = getMessengerVisibility();
  // console.log(messengerVisible);

  const userLoggedIn = user.isLoggedIn;

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
    if (matchedView === HomeView) {
      // console.log(messengerVisible, "HomeView");

      matchedView(params, messengerVisible);
      appContainer.append(navbar, chatContainer);
    } else if (matchedView === PostView) {

      // console.log(messengerVisible, "PostView");
      matchedView(params, messengerVisible);
      appContainer.append(navbar, chatContainer);
    }
  } else {
    if (matchedView === Register) {
      matchedView();
    } else if (matchedView === Login) {
      matchedView();
    }
  }
}
