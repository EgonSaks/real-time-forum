import { createPostToDatabase, fetchPosts } from "../api/api.js";
import { createPostComponent } from "./post.js"; // Import the createPostComponent function

// Create the form component and add it to the DOM
function createFormComponent() {
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
    validateFormInput(inputTitle, inputContent, errorMsg);
  });

  form.append(inputTitle, inputContent, errorMsg);
  formContainer.append(form, postButton);

  return formContainer;
}

// Validate form input
async function validateFormInput(titleInput, contentInput, errorMsg) {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  // Validate the data
  if (title === "") {
    errorMsg.innerHTML = "Title cannot be empty";
    errorMsg.style.display = "block";
  } else if (content === "") {
    errorMsg.innerHTML = "Content cannot be empty";
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

// Update the posts view
export function updatePostsView(posts) {
  const formAndPostContainer = document.getElementById("form-and-post-container");

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

export { createFormComponent };
