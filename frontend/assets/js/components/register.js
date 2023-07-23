import { navigateTo } from "../router/router.js";

export function registerFormElement() {
  console.log("registerFormElement");
  const root = document.querySelector("#app");

  const register = document.createElement("div");
  register.classList.add("register");

  const form = document.createElement("form");
  form.classList.add("register-form");

  const title = document.createElement("h1");
  title.classList.add("register-title");
  title.textContent = "Register";

  const nickname = document.createElement("input");
  nickname.classList.add("register-nickname");
  nickname.setAttribute("placeholder", "Nickname");

  const firstName = document.createElement("input");
  firstName.classList.add("register-firstName");
  firstName.setAttribute("placeholder", "First Name");

  const lastName = document.createElement("input");
  lastName.classList.add("register-lastName");
  lastName.setAttribute("placeholder", "Last Name");

  const email = document.createElement("input");
  email.classList.add("register-email");
  email.setAttribute("placeholder", "E-mail");

  const age = document.createElement("input");
  age.classList.add("register-age");
  age.setAttribute("placeholder", "Age");

  const gender = document.createElement("input");
  gender.classList.add("register-gender");
  gender.setAttribute("placeholder", "Gender");

  const password = document.createElement("input");
  password.classList.add("register-password");
  password.setAttribute("placeholder", "Password");
  password.setAttribute("type", "password");

  const registerButton = document.createElement("button");
  registerButton.classList.add("register-button");
  registerButton.setAttribute("type", "submit");
  registerButton.textContent = "Register";

  registerButton.addEventListener("click", function (e) {
    e.preventDefault();
    // validateFormInput(nickname, firstName, lastName, email, age, password);
  });

  const container = document.createElement("div");
  container.classList.add("container");

  const termsText = document.createElement("div");
  termsText.classList.add("terms-text");

  const span = document.createElement("span");
  span.textContent = "By registering, you agree to our ";
  termsText.append(span);

  const termsLink = document.createElement("a");
  termsLink.classList.add("terms-link");
  termsLink.setAttribute("href", "#");
  termsLink.textContent = "Terms of Use";
  span.append(termsLink);

  const separatorText = document.createTextNode(" and ");
  span.append(separatorText);

  const privacyLink = document.createElement("a");
  privacyLink.classList.add("privacy-link");
  privacyLink.setAttribute("href", "#");
  privacyLink.textContent = "Privacy Policy";
  span.append(privacyLink);

  const dotText = document.createTextNode(".");
  termsText.append(dotText);

  const separator = document.createElement("div");
  separator.classList.add("separator");

  const loginText = document.createElement("div");
  loginText.classList.add("login-text");

  const loginSpan = document.createElement("span");
  loginSpan.textContent = "Already have an account? ";
  loginText.append(loginSpan);

  const loginLink = document.createElement("a");
  loginLink.classList.add("login-link");
  loginLink.textContent = "Login";

  loginLink.addEventListener("click", function (e) {
    e.preventDefault();
    navigateTo("/login");
  });

  loginSpan.append(loginLink);

  container.append(termsText, separator, loginText);

  form.append(
    title,
    nickname,
    firstName,
    lastName,
    email,
    age,
    gender,
    password,
    registerButton,
    container
  );

  register.append(form);

  root.append(register);
}
