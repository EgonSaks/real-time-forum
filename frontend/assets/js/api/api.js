import { renderPosts } from "../index.js";
import { updatePostElement } from "../components/posts.js";

// Save the post to the database
async function createPostToDatabase(data) {
  // Send the data to the server
  const url = "/api/posts";
  const payload = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    // Wait for the response from the server
    const response = await fetch(url, payload);
    // Wait for the data to be parsed
    await response.json();
    // Call the function to render the updated posts
    renderPosts();
  } catch (error) {
    console.error("Error saving post to database:", error);
    throw error;
  }
}

// Read the posts from the database
async function readPostsFromDatabase() {
  // Send the request to the server
  const url = "/api/posts";

  try {
    // Wait for the response from the server
    const response = await fetch(url);
    // Wait for the data to be parsed
    const responseData = await response.json();
    // Return the data
    return responseData;
  } catch (error) {
    console.error("Error reading posts from the database:", error);
    throw error;
  }
}

// Update the post in the database
async function updatePostInDatabase(postId) {
  const postContainer = document.getElementById("post-" + postId);

  // Retrieve the updated data from the form
  const inputTitle = postContainer.querySelector(".inputTitle");
  const inputContent = postContainer.querySelector(".inputContent");

  // Retrieve the post data
  const id = postContainer.id.split("post-")[1];
  const title = inputTitle.value.trim();
  const content = inputContent.value.trim();

  // Validate the updated data
  if (title === "") {
    const errorMsg = postContainer.querySelector(".errorMsg");
    errorMsg.innerHTML = "Title cannot be empty";
    errorMsg.style.display = "block";
  } else if (content === "") {
    const errorMsg = postContainer.querySelector(".errorMsg");
    errorMsg.innerHTML = "Content cannot be empty";
    errorMsg.style.display = "block";
  } else {
    // Clear the error message
    const errorMsg = postContainer.querySelector(".errorMsg");
    errorMsg.innerHTML = "";
    errorMsg.style.display = "none";

    try {
      // Prepare the updated data
      const updatedData = {
        id: id,
        title: title,
        content: content,
      };

      // Update the post data
      await updatePostData(updatedData, postContainer);
    } catch (error) {
      console.error("Error updating post:", error);
    }
  }
}

// Update the post data
async function updatePostData(updatedData, postContainer) {
  // Send the data to the server
  const url = "/api/posts";
  const payload = {
    method: "PUT",
    body: JSON.stringify(updatedData),
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Send the updated data to the server
  const response = await fetch(url, payload);

  if (!response.ok) {
    throw new Error("Failed to update post");
  }

  // Wait for the data to be parsed
  const data = await response.json();

  // Update the post element with the new data
  updatePostElement(data, postContainer);
}

// Delete the post from the database
async function deletePostFromDatabase(postId) {
  try {
    const response = await fetch("/api/posts", {
      method: "DELETE",
      body: JSON.stringify({ postId: postId }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const postContainer = document.getElementById("post-" + postId);
      postContainer.remove();
    }
  } catch (error) {
    console.error("Error deleting post:", error);
  }
}

export {
  createPostToDatabase,
  readPostsFromDatabase,
  updatePostInDatabase,
  deletePostFromDatabase,
};
