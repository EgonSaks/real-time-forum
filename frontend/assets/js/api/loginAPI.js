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
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + 2);
      const userData = { ...data, expiresAt: expiryTime.getTime() };
      localStorage.setItem("user", JSON.stringify(userData));

      connectWebSocket(data);
      navigateTo("/");
      return data;
    })
    .catch((error) => {
      throw error;
    });
}
