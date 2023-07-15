import { editPost } from "../components/posts.js";
import { deletePostFromDatabase } from "../api/api.js";

// Show a single post
function showSinglePost(formData) {
  // Clear the existing posts
  const contentContainer = document.getElementById("contentContainer");
  contentContainer.innerHTML = "";

  // Create the postContainer
  const postContainer = document.createElement("div");
  postContainer.classList.add("postContainer");
  postContainer.setAttribute("id", "post-" + formData.id);

  // Create the postTitle
  const postTitle = document.createElement("h2");
  postTitle.classList.add("postTitle");
  postTitle.style.cursor = "initial";
  postTitle.textContent = formData.title;

  // Create the postContent
  const postContent = document.createElement("p");
  postContent.classList.add("postContent");
  postContent.textContent = formData.content;

  // Create the edit and delete buttons
  const editButton = document.createElement("button");
  editButton.classList.add("editButton");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    editPost(formData.id);
  });

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("deleteButton");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    deletePostFromDatabase(formData.id);
  });

  postContainer.append(postTitle, postContent, editButton, deleteButton);
  contentContainer.append(postContainer);

  // Update the URL
  const url = window.location.href.split("#")[0];
  const postUrl = `${url}post-${formData.id}`;
  window.history.pushState({ postId: formData.id }, formData.title, postUrl);
}

export { showSinglePost };
