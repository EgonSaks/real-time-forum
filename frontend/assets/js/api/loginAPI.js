import { navigateTo } from "../router/router.js";
import { connectWebSocket } from "../websocket/websocket.js";

const LOGIN_API = "http://localhost:8081/login";

export async function loginUser(credentials) {
  return fetch(LOGIN_API, {
    method: "POST",
    mode: 'cors',
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
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + 2);
      const userData = { ...data, expiresAt: expiryTime.getTime() };
      localStorage.setItem("user", JSON.stringify(userData));

      connectWebSocket(data.otp);
      navigateTo("/");
      return data;
    })
    .catch((error) => {
      throw error;
    });
}
