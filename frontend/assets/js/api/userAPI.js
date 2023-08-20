import { config } from "../config/config.js";

export async function fetchUsers() {
  return fetch(config.api.users, {
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

export async function fetchSingleUser(userID) {
  return fetch(config.api.user, {
    method: "GET",
    mode: "cors",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": userID,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error fetching user:", error);
      return null;
    });
}
