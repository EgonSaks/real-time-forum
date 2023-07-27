import { createPostToDatabase, fetchPosts } from "../api/api.js";
import { updatePostsView } from "../components/form.js";

// Validate form input
export async function validateFormInput(titleInput, contentInput, errorMsg) {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  // Validate the data
  if (title === "") {
    errorMsg.innerHTML = "Title cannot be empty";
    errorMsg.style.display = "block";
  } else if (title.length > 50) {
    errorMsg.innerHTML = "Title cannot exceed 50 characters";
    errorMsg.style.display = "block";
  } else if (content === "") {
    errorMsg.innerHTML = "Content cannot be empty";
    errorMsg.style.display = "block";
  } else if (content.length > 1000) {
    errorMsg.innerHTML = "Content cannot exceed 1000 characters";
    errorMsg.style.display = "block";
  } else {
    errorMsg.innerHTML = "";
    errorMsg.style.display = "none";

    // Prepare the data
    const data = {
      title: title,
      content: content,
    };

    const createdPostData = await createPostToDatabase(data);

    if (createdPostData) {
      const updatedPosts = await fetchPosts();
      updatePostsView(updatedPosts);
    } else {
      console.error("Failed to create the post.");
    }

    titleInput.value = "";
    contentInput.value = "";
  }
}

// Function to validate the updated data
export function validateUpdatedData(title, content, postContainer) {
  if (title === "") {
    const errorMsg = postContainer.querySelector(".error-msg");
    errorMsg.innerHTML = "Title cannot be empty";
    errorMsg.style.display = "block";
    return false;
  } else if (title.length > 50) {
    const errorMsg = postContainer.querySelector(".error-msg");
    errorMsg.innerHTML = "Title cannot exceed 50 characters";
    errorMsg.style.display = "block";
    return false;
  } else if (content === "") {
    const errorMsg = postContainer.querySelector(".error-msg");
    errorMsg.innerHTML = "Content cannot be empty";
    errorMsg.style.display = "block";
    return false;
  } else if (content.length > 1000) {
    const errorMsg = postContainer.querySelector(".error-msg");
    errorMsg.innerHTML = "Content cannot exceed 1000 characters";
    errorMsg.style.display = "block";
    return false;
  } else {
    const errorMsg = postContainer.querySelector(".error-msg");
    errorMsg.innerHTML = "";
    errorMsg.style.display = "none";
    return true;
  }
}
