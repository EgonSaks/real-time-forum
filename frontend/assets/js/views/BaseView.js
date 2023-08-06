import {
  createChatContainer,
  getMessengerVisibility,
} from "../components/chat.js";
import { createNavbar } from "../components/navbar.js";
import { navigateTo } from "../router/router.js";
import { HomeView } from "../views/HomeView.js";
import { Login } from "../views/Login.js";
import { PostView } from "../views/PostView.js";
import { Register } from "../views/Register.js";

// Create chatContainer and navbar outside the function
const chatContainer = await createChatContainer();

export async function createBaseView(params, matchedView, user) {
  const appContainer = document.querySelector("#app");
  appContainer.innerHTML = "";

  const messengerVisible = getMessengerVisibility();
  const userLoggedIn = user && user.isLoggedIn;
  const navbar = createNavbar(user);

  // const users = await fetchUsers();
  // console.log(users);

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
      matchedView(params, messengerVisible);
    } else if (matchedView === PostView) {
      matchedView(params, messengerVisible);
    }
    // Append the chatContainer and navbar only once
    appContainer.append(navbar, chatContainer);
  } else {
    if (matchedView === Register) {
      matchedView();
    } else if (matchedView === Login) {
      matchedView();
    }
  }
}
