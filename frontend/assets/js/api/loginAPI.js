import { navigateTo } from "../router/router.js";

const LOGIN_API = "http://localhost:8081/login";

export async function loginUser(credentials) {
  return fetch(LOGIN_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Invalid login credentials");
      }
      return response.json();
    })
    .then((data) => {
      navigateTo("/");
      return data;
    })
    .catch((error) => {
      throw error;
    });
}
