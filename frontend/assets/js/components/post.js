import { deletePostFromDatabase, updatePostData } from "../api/api.js";
import { navigateTo } from "../router/router.js";

// Create the post component
export function createPostComponent(postData) {
  // Create the post container
  const postContainer = document.createElement("div");
  postContainer.classList.add("post-container");
  postContainer.setAttribute("id", postData.id);

  // Create the post title
  const postTitle = document.createElement("h2");
  postTitle.classList.add("post-title");
  postTitle.textContent = postData.title;
  postTitle.addEventListener("click", () => {
    navigateTo("/post/" + postData.id);
  });

  // Create the post content
  const postContent = document.createElement("p");
  postContent.classList.add("post-content");
  postContent.textContent = postData.content;

  // Create the edit button
  const editButton = document.createElement("button");
  editButton.classList.add("edit-button");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    const postId = postData.id;
    editPost(postId);
  });

  // Create the delete button
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    const postId = postData.id;
    deletePostFromDatabase(postId);
    postContainer.remove();
  });

  postContainer.append(postTitle, postContent, editButton, deleteButton);
  return postContainer;
}

// Edit the post
export function editPost(postId) {
  // Retrieve the existing post data
  const postContainer = document.getElementById(postId);
  const postTitle = postContainer.querySelector(".post-title");
  const postContent = postContainer.querySelector(".post-content");

  const title = postTitle.textContent;
  const content = postContent.textContent;

  // Remove the existing edit button
  const editButton = postContainer.querySelector(".edit-button");
  const deleteButton = postContainer.querySelector(".delete-button");
  editButton.remove();
  deleteButton.remove();
  postTitle.remove();
  postContent.remove();

  // Create the form
  const form = document.createElement("form");
  form.classList.add("form");

  // Create the input fields
  const inputTitle = document.createElement("input");
  inputTitle.classList.add("input-title");
  inputTitle.setAttribute("type", "text");
  inputTitle.setAttribute("value", title);

  // Create the content field
  const inputContent = document.createElement("textarea");
  inputContent.classList.add("input-content");
  inputContent.setAttribute("type", "text");
  inputContent.setAttribute("rows", "3");
  inputContent.textContent = content;

  const errorMsg = document.createElement("p");
  errorMsg.classList.add("error-msg");
  errorMsg.style.display = "none";

  // Create the update button
  const updateButton = document.createElement("button");
  updateButton.classList.add("update-button");
  updateButton.textContent = "Update";
  updateButton.addEventListener("click", (e) => {
    e.preventDefault;
    updatePostInDatabase(postId);
  });

  // Create the discard button
  const discardButton = document.createElement("button");
  discardButton.classList.add("discard-button");
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
export function updatePostElement(data, postContainer) {
  // Update the post element with the new data
  const postTitle = document.createElement("h2");
  postTitle.classList.add("post-title");
  postTitle.textContent = data.title;

  // Create the post content
  const postContent = document.createElement("p");
  postContent.classList.add("post-content");
  postContent.textContent = data.content;

  postContainer.innerHTML = "";
  postContainer.append(postTitle, postContent);

  // Create the edit and delete buttons
  const editButton = document.createElement("button");
  editButton.classList.add("edit-button");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    const postId = data.id;
    editPost(postId);
  });

  // Create the delete button
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    const postId = data.id;
    deletePostFromDatabase(postId);
  });

  postContainer.append(editButton, deleteButton);
}

// Update the post in the database
export async function updatePostInDatabase(postId) {
  const postContainer = document.getElementById(postId);

  // Retrieve the updated data from the form
  const inputTitle = postContainer.querySelector(".input-title");
  const inputContent = postContainer.querySelector(".input-content");

  // Retrieve the post data
  const id = postContainer.id;
  const title = inputTitle.value.trim();
  const content = inputContent.value.trim();

  // Validate the updated data
  if (title === "") {
    const errorMsg = postContainer.querySelector(".error-msg");
    errorMsg.innerHTML = "Title cannot be empty";
    errorMsg.style.display = "block";
  } else if (content === "") {
    const errorMsg = postContainer.querySelector(".error-msg");
    errorMsg.innerHTML = "Content cannot be empty";
    errorMsg.style.display = "block";
  } else {
    // Clear the error message
    const errorMsg = postContainer.querySelector(".error-msg");
    errorMsg.innerHTML = "";
    errorMsg.style.display = "none";

    // Prepare the updated data
    const updatedData = {
      id: id,
      title: title,
      content: content,
    };

    const updateData = await updatePostData(updatedData, postContainer);
    updatePostElement(updateData, postContainer);
  }
}
