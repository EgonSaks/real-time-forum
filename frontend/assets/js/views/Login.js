import { loginFormElement } from "../components/login.js";

export function Login() {
  const root = document.querySelector("#app");
  root.innerHTML = "";
  loginFormElement();
}
