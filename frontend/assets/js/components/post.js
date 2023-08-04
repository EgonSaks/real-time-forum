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

export function createPostFormComponent() {
  const formContainer = document.createElement("div");
  formContainer.classList.add("form-container");

  const form = document.createElement("form");
  form.classList.add("form");

  const inputTitle = document.createElement("input");
  inputTitle.classList.add("input-title");
  inputTitle.setAttribute("type", "text");
  inputTitle.setAttribute("placeholder", "Title:");

  const inputContent = document.createElement("textarea");
  inputContent.classList.add("input-content");
  inputContent.setAttribute("rows", "5");
  inputContent.setAttribute("placeholder", "What is happening?!");
  inputContent.addEventListener("input", countCharacters);

  const charCountSpan = document.createElement("span");
  charCountSpan.classList.add("character-count");
  charCountSpan.textContent = "";

  const errorMsg = document.createElement("p");
  errorMsg.classList.add("error-msg");
  errorMsg.style.display = "none";

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

export function createPostComponent(post) {
  const postContainer = document.createElement("div");
  postContainer.classList.add("post-container");
  postContainer.setAttribute("id", post.id);

  const postTitle = document.createElement("h2");
  postTitle.classList.add("post-title");
  postTitle.textContent = post.title;
  postTitle.addEventListener("click", () => {
    navigateTo("/post/" + post.id);
  });

  const author = document.createElement("p");
  author.classList.add("author");
  author.textContent = post.author;

  const postContent = document.createElement("p");
  postContent.classList.add("post-content");
  postContent.textContent = post.content;

  const createdAt = document.createElement("p");
  createdAt.classList.add("created-at");
  createdAt.textContent = convertTime(post.created_at);

  const editButton = document.createElement("button");
  editButton.classList.add("edit-button");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    const postId = post.id;
    editPost(postId);
  });

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
  const data = await fetchPosts();

  data.forEach((post) => {
    const postComponent = createPostComponent(post);
    formAndPostContainer.append(postComponent);
  });
}

export function editPost(postId) {
  const postContainer = document.getElementById(postId);
  const postTitle = postContainer.querySelector(".post-title");
  const postContent = postContainer.querySelector(".post-content");

  const author = postContainer.querySelector(".author");
  const createdAt = postContainer.querySelector(".created-at");

  const title = postTitle.textContent;
  const content = postContent.textContent;

  const editButton = postContainer.querySelector(".edit-button");
  const deleteButton = postContainer.querySelector(".delete-button");
  editButton.remove();
  deleteButton.remove();
  postTitle.remove();
  postContent.remove();

  const form = document.createElement("form");
  form.classList.add("form");

  const inputTitle = document.createElement("input");
  inputTitle.classList.add("input-title");
  inputTitle.setAttribute("type", "text");
  inputTitle.setAttribute("value", title);

  const inputContent = document.createElement("textarea");
  inputContent.classList.add("input-content");
  inputContent.setAttribute("type", "text");
  inputContent.setAttribute("rows", "3");
  inputContent.textContent = content;

  const errorMsg = document.createElement("p");
  errorMsg.classList.add("error-msg");
  errorMsg.style.display = "none";

  const updateButton = document.createElement("button");
  updateButton.classList.add("update-button");
  updateButton.textContent = "Update";
  updateButton.addEventListener("click", (e) => {
    e.preventDefault();
    updatePostInDatabase(postId);
  });

  const discardButton = document.createElement("button");
  discardButton.classList.add("discard-button");
  discardButton.textContent = "Discard";
  discardButton.addEventListener("click", () => {
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

export function updatePostElement(post, postContainer) {
  const author = postContainer.querySelector(".author");
  const createdAt = postContainer.querySelector(".created-at");

  const postTitle = document.createElement("h2");
  postTitle.classList.add("post-title");
  postTitle.textContent = post.title;
  postTitle.addEventListener("click", () => {
    navigateTo("/post/" + post.id);
  });

  const postContent = document.createElement("p");
  postContent.classList.add("post-content");
  postContent.textContent = post.content;

  postContainer.innerHTML = "";
  postContainer.append(author, postTitle, postContent, createdAt);

  const editButton = document.createElement("button");
  editButton.classList.add("edit-button");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    const postId = post.id;
    editPost(postId);
  });

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

export async function updatePostInDatabase(postId) {
  const postContainer = document.getElementById(postId);

  const inputTitle = postContainer.querySelector(".input-title");
  const inputContent = postContainer.querySelector(".input-content");

  const id = postContainer.id;
  const title = inputTitle.value.trim();
  const content = inputContent.value.trim();

  const isValidData = validateUpdatedData(title, content, postContainer);

  if (isValidData) {
    const updatedData = {
      id: id,
      title: title,
      content: content,
    };

    const updateData = await updatePostData(updatedData, postContainer);
    updatePostElement(updateData, postContainer);
  }
}

export function updatePostsView(posts) {
  const formAndPostContainer = document.getElementById(
    "form-and-post-container"
  );

  const firstPostComponent = formAndPostContainer.querySelector(
    ".post-container:first-child"
  );

  const latestPost = posts[posts.length - 1];
  const latestPostComponent = createPostComponent(latestPost);

  if (firstPostComponent) {
    formAndPostContainer.insertBefore(latestPostComponent, firstPostComponent);
  } else {
    formAndPostContainer.append(latestPostComponent);
  }
}
