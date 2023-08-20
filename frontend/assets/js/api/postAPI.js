import { config } from "../config/config.js";

export async function fetchPosts() {
  return fetch(config.api.posts, {
    mode: "cors",
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error fetching posts");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error fetching posts:", error);
      return [];
    });
}

export async function createPostToDatabase(data) {
  return fetch(config.api.post, {
    method: "POST",
    mode: "cors",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error creating post");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error creating post:", error);
      return null;
    });
}

export async function fetchSinglePost(postID) {
  return fetch(config.api.post + postID)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error fetching post:", error);
      return null;
    });
}

export async function deletePostFromDatabase(postId) {
  return fetch(config.api.post, {
    method: "DELETE",
    mode: "cors",
    credentials: "include",
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

export async function updatePostData(updatedData) {
  const url = config.api.post;
  const payload = {
    method: "PUT",
    mode: "cors",
    credentials: "include",
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
