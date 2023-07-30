const API_BASE_URL = "http://localhost:8081/api/comments";

// Function to create a new comment in the database
export async function createCommentToDatabase(data) {
  return fetch(API_BASE_URL, {
    method: "POST",
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

// Function to fetch all comments from the database
export async function fetchComments() {
  return fetch(API_BASE_URL)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error fetching comments:", error);
      return [];
    });
}

// Function to delete a comment from the database
export async function deleteCommentFromDatabase(commentId) {
  return fetch(API_BASE_URL, {
    method: "DELETE",
    body: JSON.stringify({ commentId: commentId }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response;
    })
    .catch((error) => {
      console.error("Error deleting comment:", error);
    });
}

// Function to update a comment in the database
export async function updateCommentData(updatedData) {
  const url = API_BASE_URL;
  const payload = {
    method: "PUT",
    body: JSON.stringify(updatedData),
    headers: {
      "Content-Type": "application/json",
    },
  };

  return fetch(url, payload)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update comment");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error updating comment:", error);
    });
}
