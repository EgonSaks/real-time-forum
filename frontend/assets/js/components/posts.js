import { deletePostFromDatabase, updatePostInDatabase } from "../api/api.js";
import { showSinglePost } from "./singlePost.js";

// Create the post component
function createPostComponent(formData) {
  // Create the post container
  const postContainer = document.createElement("div");
  postContainer.classList.add("postContainer");
  postContainer.setAttribute("id", "post-" + formData.id);

  // Create the post title
  const postTitle = document.createElement("h2");
  postTitle.classList.add("postTitle");
  postTitle.textContent = formData.title;

  postTitle.addEventListener("click", function () {
    postTitle.style.color = "red";
    showSinglePost(formData);
  });

  // Create the post content
  const postContent = document.createElement("p");
  postContent.classList.add("postContent");
  postContent.textContent = formData.content;

  // Create the edit button
  const editButton = document.createElement("button");
  editButton.classList.add("editButton");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    const postId = formData.id;
    editPost(postId);
  });

  // Create the delete button
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("deleteButton");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    const postId = formData.id;
    deletePostFromDatabase(postId);
  });

  postContainer.append(postTitle, postContent, editButton, deleteButton);
  return postContainer;
}

// Edit the post
function editPost(postId) {
  // Retrieve the existing post data
  const postContainer = document.getElementById("post-" + postId);
  const postTitle = postContainer.querySelector(".postTitle");
  const postContent = postContainer.querySelector(".postContent");

  const title = postTitle.textContent;
  const content = postContent.textContent;

  // Remove the existing edit button
  const editButton = postContainer.querySelector(".editButton");
  const deleteButton = postContainer.querySelector(".deleteButton");
  editButton.remove();
  deleteButton.remove();
  postTitle.remove();
  postContent.remove();

  // Create the form
  const form = document.createElement("form");
  form.classList.add("form");

  // Create the input fields
  const inputTitle = document.createElement("input");
  inputTitle.classList.add("inputTitle");
  inputTitle.setAttribute("type", "text");
  inputTitle.setAttribute("value", title);

  // Create the content field
  const inputContent = document.createElement("textarea");
  inputContent.classList.add("inputContent");
  inputContent.setAttribute("type", "text");
  inputContent.setAttribute("rows", "3");
  inputContent.textContent = content;

  const errorMsg = document.createElement("p");
  errorMsg.classList.add("errorMsg");
  errorMsg.style.display = "none";

  // Create the update button
  const updateButton = document.createElement("button");
  updateButton.classList.add("updateButton");
  updateButton.textContent = "Update";
  updateButton.addEventListener("click", (e) => {
    e.preventDefault;
    updatePostInDatabase(postId);
  });

  // Create the discard button
  const discardButton = document.createElement("button");
  discardButton.classList.add("discardButton");
  discardButton.textContent = "Discard";
  discardButton.addEventListener("click", () => {
    // Reload the original post content
    postContainer.innerHTML = "";
    postContainer.append(postTitle, postContent, editButton, deleteButton);
  });

  form.append(inputTitle, inputContent, errorMsg);

  postContainer.append(form, updateButton, discardButton);
}

// Update the post element
function updatePostElement(data, postContainer) {
  // Update the post element with the new data
  const postTitle = document.createElement("h2");
  postTitle.classList.add("postTitle");
  postTitle.textContent = data.title;

  // Create the post content
  const postContent = document.createElement("p");
  postContent.classList.add("postContent");
  postContent.textContent = data.content;

  postContainer.innerHTML = "";
  postContainer.append(postTitle, postContent);

  // Create the edit and delete buttons
  const editButton = document.createElement("button");
  editButton.classList.add("editButton");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    const postId = data.id;
    editPost(postId);
  });

  // Create the delete button
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("deleteButton");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    const postId = data.id;
    deletePostFromDatabase(postId);
  });

  postContainer.append(editButton, deleteButton);
}

export { createPostComponent, editPost, updatePostElement };
