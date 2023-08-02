import { navigateTo } from "../router/router.js";
import { validateLoginFormInput } from "../validators/inputValidations.js";

export function loginFormElement() {
  const root = document.querySelector("#app");

  const login = document.createElement("div");
  login.classList.add("login");

  const form = document.createElement("form");
  form.classList.add("login-form");

  const title = document.createElement("h1");
  title.classList.add("login-title");
  title.textContent = "Login";

  const username = document.createElement("input");
  username.classList.add("login-username");
  username.setAttribute("placeholder", "E-mail or username");

  const password = document.createElement("input");
  password.classList.add("login-password");
  password.setAttribute("placeholder", "Password");
  password.setAttribute("type", "password");
  password.setAttribute("autocomplete", "current-password");

  // Create the error message
  const errorMsg = document.createElement("p");
  errorMsg.classList.add("error-msg");
  errorMsg.style.display = "none";

  const loginButton = document.createElement("button");
  loginButton.classList.add("login-button");
  loginButton.setAttribute("type", "submit");
  loginButton.textContent = "Login";

  loginButton.addEventListener("click", function (e) {
    e.preventDefault();
    validateLoginFormInput(username, password);
  });

  const container = document.createElement("div");
  container.classList.add("container");

  const register = document.createElement("div");
  register.classList.add("register-text");

  const registerSpan = document.createElement("span");
  registerSpan.textContent = "Don't have an account? ";

  const registerLink = document.createElement("a");
  registerLink.classList.add("register-link");
  registerLink.textContent = "Register";
  registerLink.addEventListener("click", function (e) {
    e.preventDefault();
    navigateTo("/register");
  });

  registerSpan.append(registerLink);

  const separator = document.createElement("div");
  separator.classList.add("separator");

  register.append(registerSpan);

  container.append(separator, register);

  form.append(title, username, password, errorMsg, loginButton, container);

  login.append(form);

  root.append(login);
}
