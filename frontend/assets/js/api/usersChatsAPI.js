import { config } from "../config/config.js";

export async function fetchChats() {
  return fetch(config.api.chats, {
    mode: "cors",
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error fetching users");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error fetching users:", error);
      return [];
    });
}
