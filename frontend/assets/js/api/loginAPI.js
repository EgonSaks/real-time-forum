import { config } from "../config/config.js";
import { navigateTo } from "../router/router.js";
import { connectWebSocket } from "../websocket/websocket.js";

export async function loginUser(credentials) {
  return fetch(config.api.login, {
    method: "POST",
    mode: "cors",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Invalid login credentials");
      }
      return response.json();
    })
    .then((data) => {
      connectWebSocket(data);
      navigateTo("/");
      return data;
    })
    .catch((error) => {
      throw error;
    });
}
