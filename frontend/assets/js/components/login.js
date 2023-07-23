import { navigateTo } from "../router/router.js";

export function loginFormElement() {
  const root = document.querySelector("#app");

  const login = document.createElement("div");
  login.classList.add("login");

  const form = document.createElement("form");
  form.classList.add("login-form");

  const title = document.createElement("h1");
  title.classList.add("login-title");
  title.textContent = "Login";

  const nickname = document.createElement("input");
  nickname.classList.add("login-nickname");
  nickname.setAttribute("placeholder", "Enter your nickname or e-mail");

  const password = document.createElement("input");
  password.classList.add("login-password");
  password.setAttribute("placeholder", "Password");
  password.setAttribute("type", "password");

  const loginButton = document.createElement("button");
  loginButton.classList.add("login-button");
  loginButton.setAttribute("type", "submit");
  loginButton.textContent = "login";

  loginButton.addEventListener("click", function (e) {
    e.preventDefault();
    // validateFormInput(nickname, firstName, lastName, email, age, password);
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

  form.append(title, nickname, password, loginButton, container);

  login.append(form);

  root.append(login);
}
