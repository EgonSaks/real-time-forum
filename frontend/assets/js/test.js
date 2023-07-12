function createForm() {
  // Create the formContainer
  const formContainer = document.createElement("div");
  formContainer.classList.add("formContainer");

  // Create the form
  const form = document.createElement("form");
  form.classList.add("form");

  // Create the input fields
  const inputTitle = document.createElement("input");
  inputTitle.classList.add("inputTitle");
  inputTitle.setAttribute("type", "text");
  inputTitle.setAttribute("placeholder", "Title:");

  const inputContent = document.createElement("textarea");
  inputContent.classList.add("inputContent");
  inputContent.setAttribute("type", "text");
  inputContent.setAttribute("rows", "5");
  inputContent.setAttribute("placeholder", "What is happening?!");

  const errorMsg = document.createElement("p");
  errorMsg.classList.add("errorMsg");
  errorMsg.style.display = "none";

  // Create the submit button
  const postButton = document.createElement("button");
  postButton.classList.add("postButton");
  postButton.setAttribute("type", "submit");
  postButton.textContent = "Post";

  // Add event listener to the form submission
  postButton.addEventListener("click", function (e) {
    e.preventDefault();
    validateForm(inputTitle, inputContent, errorMsg);
  });

  form.append(inputTitle, inputContent, errorMsg);
  formContainer.append(form, postButton);

  return formContainer;
}
// Validate the form
function validateForm(titleInput, contentInput, errorMsg) {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (title === "") {
    errorMsg.innerHTML = "Title cannot be empty";
    errorMsg.style.display = "block";
  } else if (content === "") {
    errorMsg.innerHTML = "Content cannot be empty";
    errorMsg.style.display = "block";
  } else {
    errorMsg.innerHTML = "";
    errorMsg.style.display = "none";

    data = {
      title: title,
      content: content,
    };

    createPost(data);
    titleInput.value = "";
    contentInput.value = "";
  }
}
// Save the post to the database and return the response with the data
function createPost(data) {
  fetch("/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      createPostElement(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
// Post element/component
function createPostElement(formData) {
  const postContainer = document.createElement("div");
  postContainer.classList.add("postContainer");
  postContainer.setAttribute("id", "post-" + formData.id);

  // Create the postTitle
  const postTitle = document.createElement("h2");
  postTitle.classList.add("postTitle");
  postTitle.textContent = formData.title;

  // Add event listener to the post title
  postTitle.addEventListener("click", () => {
    showSinglePost(formData);
  });

  // Create the postContent
  const postContent = document.createElement("p");
  postContent.classList.add("postContent");
  postContent.textContent = formData.content;

  // Create the edit and delete buttons
  const editButton = document.createElement("button");
  editButton.classList.add("editButton");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    const postId = formData.id;
    editPost(postId);
  });

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("deleteButton");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    const postId = formData.id;
    deletePost(postId);
  });

  postContainer.append(postTitle, postContent, editButton, deleteButton);
  // return postContainer;

  const root = document.getElementById("app");
  root.append(postContainer);
}
// Get all posts from the database
function getPosts() {
  fetch("/api/posts")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((post) => {
        createPostElement(post);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
// Edit post
function editPost(postId) {
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
    updatePost(postId);
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

//Update post
function updatePost(postId) {
  const postContainer = document.getElementById("post-" + postId);

  // Retrieve the updated data from the form
  const inputTitle = postContainer.querySelector(".inputTitle");
  const inputContent = postContainer.querySelector(".inputContent");

  const id = postContainer.id.split("post-")[1];
  const title = inputTitle.value.trim();
  const content = inputContent.value.trim();

  // Validate the data
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

    // Prepare the updated data
    const updatedData = {
      id: id,
      title: title,
      content: content,
    };

    // Send the updated data to the server
    fetch("/api/posts", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    })
      .then((response) => response.json())
      .then((data) => {
        // Update the post element with the new data
        const postTitle = document.createElement("h2");
        postTitle.classList.add("postTitle");
        postTitle.textContent = data.title;

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

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("deleteButton");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
          const postId = data.id;
          deletePost(postId);
        });

        postContainer.append(editButton, deleteButton);
      })
      .catch((error) => {
        console.error("Error updating post:", error);
      });
  }
}
// Delete post
function deletePost(postId) {
  fetch("/api/posts", {
    method: "DELETE",
    body: JSON.stringify({ postId: postId }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        const postContainer = document.getElementById("post-" + postId);
        postContainer.remove();
      }
    })
    .catch((error) => console.error("Error deleting post:", error));
}

// Show a single post
function showSinglePost(formData) {
  // Clear the existing posts
  const root = document.getElementById("app");
  root.innerHTML = "";

  // Create the postContainer
  const postContainer = document.createElement("div");
  postContainer.classList.add("postContainer");
  postContainer.setAttribute("id", "post-" + formData.id);

  // Create the postTitle
  const postTitle = document.createElement("h2");
  postTitle.classList.add("postTitle");
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
    deletePost(formData.id);
  });

  postContainer.append(postTitle, postContent, editButton, deleteButton);
  root.append(postContainer);

  // Update the URL
  const url = window.location.href.split("#")[0]; // Get the base URL
  const postUrl = `${url}#post-${formData.id}`; // Append the post ID to the URL
  window.history.pushState({ postId: formData.id }, formData.title, postUrl);
}

// Create the base view
function createBaseView() {
  const root = document.getElementById("app");

  // Create the pageTitle
  const pageTitle = document.createElement("h1");
  pageTitle.classList.add("pageTitle");
  pageTitle.textContent = "Public room v1.0";

  // Create the postForm
  const postForm = createForm();

  root.append(pageTitle, postForm);

  getPosts();
}
// Render the page
function renderPage() {
  const root = document.getElementById("app");

  // Clear the existing posts
  root.innerHTML = "";
  createBaseView();

  // Handle browser history navigation
  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.postId) {
      // Show the single post based on the stored post ID
      const postId = event.state.postId;
      showSinglePost({ id: postId }); // Replace this with your actual logic to fetch the post data
    } else {
      // Show the main view
      createBaseView();
    }
  });
}

renderPage();
