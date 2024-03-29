import { config } from "../config/config.js";

export async function createCommentToDatabase(data) {
  return fetch(config.api.comment, {
    method: "POST",
    mode: "cors",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error creating comment:", error);
      return null;
    });
}

export async function fetchCommentsByPostID(postId) {
  return fetch(config.api.comment, {
    method: "GET",
    mode: "cors",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": postId,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error fetching comment:", error);
      return null;
    });
}
