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
  const url = window.location.href.split("#")[0]; // Get the base URL
  const postUrl = `${url}#post-${formData.id}`; // Append the post ID to the URL
  window.history.pushState({ postId: formData.id }, formData.title, postUrl);
}

// Render the posts on the page
async function renderPosts() {
  const root = document.getElementById("app");
  root.innerHTML = "";

  //   Create the pageTitle
  const pageTitle = document.createElement("h1");
  pageTitle.classList.add("pageTitle");
  pageTitle.textContent = "Public room v1.0";

  const contentContainer = document.createElement("div");
  contentContainer.setAttribute("id", "contentContainer");

  const formAndPostsContainer = document.createElement("div");
  formAndPostsContainer.setAttribute("id", "formAndPostsContainer");

  const formComponent = createFormComponent();

  formAndPostsContainer.append(formComponent);

  const postsData = await readPostsFromDatabase();

  postsData.forEach((postData) => {
    const postComponent = createPostComponent(postData);
    formAndPostsContainer.append(postComponent);
  });

  // Handle browser history navigation
  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.postId) {
      // Show the single post based on the stored post ID
      const postId = event.state.postId;
      showSinglePost({ id: postId }); // Replace this with your actual logic to fetch the post data
    } else {
      // Show the main view
      renderPosts();
    }
  });

  contentContainer.append(formAndPostsContainer);
  root.append(pageTitle, contentContainer);
}

// Call the renderPosts function to initialize the page
renderPosts();
