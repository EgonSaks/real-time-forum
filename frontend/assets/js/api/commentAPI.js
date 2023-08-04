// const COMMENTS_API = "http://localhost:8081/api/comments";
const COMMENT_API = "http://localhost:8081/api/comment";

export async function createCommentToDatabase(data) {
  return fetch(COMMENT_API, {
    method: "POST",
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
  return fetch(COMMENT_API, {
    method: "GET",
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
