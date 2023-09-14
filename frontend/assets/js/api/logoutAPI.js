import { config } from "../config/config.js";
import { navigateTo } from "../router/router.js";
import { closeWebSocket } from "../websocket/websocket.js";

export async function logoutUser() {
  fetch(config.api.logout, {
    method: "GET",
    mode: "cors",
    credentials: "include",
  })
    .then((response) => {
      if (response.ok) {
        closeWebSocket();
        navigateTo("/login");
      } else {
        console.error("Logout error:", response.statusText);
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}
