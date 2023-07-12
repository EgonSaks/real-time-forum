import { createPostToDatabase } from "../api/api.js";

// Create the form component and add it to the DOM
function createFormComponent() {
  const formContainer = document.createElement("div");
  formContainer.classList.add("formContainer");

  // Create the form
  const form = document.createElement("form");
  form.classList.add("form");

  // Create the title field
  const inputTitle = document.createElement("input");
  inputTitle.classList.add("inputTitle");
  inputTitle.setAttribute("type", "text");
  inputTitle.setAttribute("placeholder", "Title:");

  // Create the content field
  const inputContent = document.createElement("textarea");
  inputContent.classList.add("inputContent");
  inputContent.setAttribute("rows", "5");
  inputContent.setAttribute("placeholder", "What is happening?!");

  // Create the error message
  const errorMsg = document.createElement("p");
  errorMsg.classList.add("errorMsg");
  errorMsg.style.display = "none";

  // Create the post button
  const postButton = document.createElement("button");
  postButton.classList.add("postButton");
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
function validateFormInput(titleInput, contentInput, errorMsg) {
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

    createPostToDatabase(data);

    // Clear the input fields
    titleInput.value = "";
    contentInput.value = "";
  }
}

export { createFormComponent };
