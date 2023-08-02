const POST_API = "http://localhost:8081/api/post/";
const POSTS_API = "http://localhost:8081/api/posts";

// Function to fetch all posts from the database
export async function fetchPosts() {
  return fetch(POSTS_API, {
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

// Function to create a new post in the database
export async function createPostToDatabase(data) {
  return fetch(POST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
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
  return fetch(POST_API + postID)
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

// Function to delete a post from the database
export async function deletePostFromDatabase(postId) {
  return fetch(POST_API, {
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
  const url = POST_API;
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
