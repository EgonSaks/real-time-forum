import {
  deletePostFromDatabase,
  fetchPosts,
  updatePostData,
} from "../api/postAPI.js";
import { navigateTo } from "../router/router.js";
import { countCharacters } from "../utils/characterCount.js";
import { convertTime } from "../utils/timeConverter.js";
import {
  validatePostInput,
  validateUpdatedData,
} from "../validators/inputValidations.js";

// Create the form component and add it to the DOM
export function createPostFormComponent() {
  const formContainer = document.createElement("div");
  formContainer.classList.add("form-container");

  // Create the form
  const form = document.createElement("form");
  form.classList.add("form");

  // Create the title field
  const inputTitle = document.createElement("input");
  inputTitle.classList.add("input-title");
  inputTitle.setAttribute("type", "text");
  inputTitle.setAttribute("placeholder", "Title:");

  // Create the content field
  const inputContent = document.createElement("textarea");
  inputContent.classList.add("input-content");
  inputContent.setAttribute("rows", "5");
  inputContent.setAttribute("placeholder", "What is happening?!");
  inputContent.addEventListener("input", countCharacters);

  // Create the character count element
  const charCountSpan = document.createElement("span");
  charCountSpan.classList.add("character-count");
  charCountSpan.textContent = "";

  // Create the error message
  const errorMsg = document.createElement("p");
  errorMsg.classList.add("error-msg");
  errorMsg.style.display = "none";

  // Create the post button
  const postButton = document.createElement("button");
  postButton.classList.add("post-button");
  postButton.setAttribute("type", "submit");
  postButton.textContent = "Post";

  postButton.addEventListener("click", function (e) {
    e.preventDefault();
    validatePostInput(inputTitle, inputContent, errorMsg);
    charCountSpan.textContent = "";
  });

  form.append(inputTitle, inputContent, errorMsg);
  formContainer.append(form, postButton, charCountSpan);

  return formContainer;
}

// Create the post component
export function createSinglePostComponent(data) {
  // Create the post container
  const postContainer = document.createElement("div");
  postContainer.classList.add("post-container");
  postContainer.setAttribute("id", data.post.id);

  // Create the post title
  const postTitle = document.createElement("h2");
  postTitle.classList.add("post-title");
  postTitle.textContent = data.post.title;
  postTitle.addEventListener("click", () => {
    navigateTo("/post/" + data.post.id);
  });

  // Displaying the author's name
  const author = document.createElement("p");
  author.classList.add("author");
  author.textContent = "John Doe";

  // Create the post content
  const postContent = document.createElement("p");
  postContent.classList.add("post-content");
  postContent.textContent = data.post.content;

  // Displaying the post creation date and time
  const createdAt = document.createElement("p");
  createdAt.classList.add("created-at");
  createdAt.textContent = convertTime(data.post.created_at);

  // Create the edit button
  const editButton = document.createElement("button");
  editButton.classList.add("edit-button");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    const postId = data.post.id;
    editPost(postId);
  });

  // Create the delete button
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    const postId = data.post.id;
    deletePostFromDatabase(postId);
    postContainer.remove();
    navigateTo("/");
  });

  postContainer.append(
    author,
    postTitle,
    postContent,
    createdAt,
    editButton,
    deleteButton
  );
  return postContainer;
}

export function createPostComponent(post) {
  // Create the post container
  const postContainer = document.createElement("div");
  postContainer.classList.add("post-container");
  postContainer.setAttribute("id", post.id);

  // Create the post title
  const postTitle = document.createElement("h2");
  postTitle.classList.add("post-title");
  postTitle.textContent = post.title;
  postTitle.addEventListener("click", () => {
    navigateTo("/post/" + post.id);
  });

  // Displaying the author's name
  const author = document.createElement("p");
  author.classList.add("author");
  author.textContent = "John Doe";

  // Create the post content
  const postContent = document.createElement("p");
  postContent.classList.add("post-content");
  postContent.textContent = post.content;

  // Displaying the post creation date and time
  const createdAt = document.createElement("p");
  createdAt.classList.add("created-at");
  createdAt.textContent = convertTime(post.created_at);

  // Create the edit button
  const editButton = document.createElement("button");
  editButton.classList.add("edit-button");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    const postId = post.id;
    editPost(postId);
  });

  // Create the delete button
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    const postId = post.id;
    deletePostFromDatabase(postId);
    postContainer.remove();
  });

  postContainer.append(
    author,
    postTitle,
    postContent,
    createdAt,
    editButton,
    deleteButton
  );
  return postContainer;
}

export async function getPosts(formAndPostContainer) {
  // Get the data using fetchPosts function
  const data = await fetchPosts();

  // Create the post components
  data.forEach((post) => {
    const postComponent = createPostComponent(post);
    formAndPostContainer.append(postComponent);
  });
}

// Edit the post
export function editPost(postId) {
  // Retrieve the existing post data
  const postContainer = document.getElementById(postId);
  const postTitle = postContainer.querySelector(".post-title");
  const postContent = postContainer.querySelector(".post-content");

  const author = postContainer.querySelector(".author");
  const createdAt = postContainer.querySelector(".created-at");

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
    e.preventDefault();
    updatePostInDatabase(postId);
  });

  // Create the discard button
  const discardButton = document.createElement("button");
  discardButton.classList.add("discard-button");
  discardButton.textContent = "Discard";
  discardButton.addEventListener("click", () => {
    // Reload the original post content
    postContainer.innerHTML = "";
    postContainer.append(
      author,
      postTitle,
      postContent,
      createdAt,
      editButton,
      deleteButton
    );
  });

  form.append(inputTitle, inputContent, errorMsg);

  postContainer.append(author, form, createdAt, updateButton, discardButton);
}

// Update the post element
export function updatePostElement(post, postContainer) {
  const author = postContainer.querySelector(".author");
  const createdAt = postContainer.querySelector(".created-at");

  // Update the post element with the new data
  const postTitle = document.createElement("h2");
  postTitle.classList.add("post-title");
  postTitle.textContent = post.title;
  postTitle.addEventListener("click", () => {
    navigateTo("/post/" + post.id);
  });

  // Create the post content
  const postContent = document.createElement("p");
  postContent.classList.add("post-content");
  postContent.textContent = post.content;

  postContainer.innerHTML = "";
  postContainer.append(author, postTitle, postContent, createdAt);

  // Create the edit and delete buttons
  const editButton = document.createElement("button");
  editButton.classList.add("edit-button");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    const postId = post.id;
    editPost(postId);
  });

  // Create the delete button
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    const postId = post.id;
    deletePostFromDatabase(postId);
    postContainer.remove();
    navigateTo("/");
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

  // Validate the updated data using the new function
  const isValidData = validateUpdatedData(title, content, postContainer);

  if (isValidData) {
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

// Update the posts view
export function updatePostsView(posts) {
  const formAndPostContainer = document.getElementById(
    "form-and-post-container"
  );

  // Get the first post component (if any)
  const firstPostComponent = formAndPostContainer.querySelector(
    ".post-container:first-child"
  );

  // Create the post component for the latest post
  const latestPost = posts[posts.length - 1]; // Get the latest post
  const latestPostComponent = createPostComponent(latestPost);

  if (firstPostComponent) {
    // If there are existing posts, insert the new post before the first post
    formAndPostContainer.insertBefore(latestPostComponent, firstPostComponent);
  } else {
    // If there are no existing posts, simply append the new post
    formAndPostContainer.append(latestPostComponent);
  }
}
