import { registerFormElement } from "../components/register.js";

export function Register() {
  const root = document.querySelector("#app");
  root.innerHTML = "";
  registerFormElement();
}
