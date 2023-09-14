import { config } from "../config/config.js";

export async function fetchSession(cookieID) {
  return fetch(config.api.session, {
    method: "GET",
    mode: "cors",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": cookieID,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error fetching session:", error);
      return null;
    });
}
