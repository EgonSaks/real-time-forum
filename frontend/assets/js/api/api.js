const API_BASE_URL = "http://localhost:8081/api/posts";

// Function to create a new post in the database
export async function createPostToDatabase(data) {
  return fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error creating post:", error);
      return null;
    });
}

// Function to fetch all posts from the database
export async function fetchPosts() {
  return fetch(API_BASE_URL)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error fetching posts:", error);
      return [];
    });
}
// Function to delete a post from the database
export async function deletePostFromDatabase(postId) {
  return fetch(API_BASE_URL, {
    method: "DELETE",
    body: JSON.stringify({ postId: postId }),
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
      console.error("Error deleting post:", error);
    });
}

// Function to update a post in the database
export async function updatePostData(updatedData) {
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
        throw new Error("Failed to update post");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error updating post:", error);
    });
}
