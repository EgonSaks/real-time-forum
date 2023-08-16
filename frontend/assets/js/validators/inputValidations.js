import { createCommentToDatabase } from "../api/commentAPI.js";
import { loginUser } from "../api/loginAPI.js";
import { createPostToDatabase, fetchPosts } from "../api/postAPI.js";
import { registerUser } from "../api/registerAPI.js";
import { createCommentComponent } from "../components/comment.js";
import { updatePostsView } from "../components/post.js";

export async function validatePostInput(titleInput, contentInput, errorMsg) {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

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

    const post = {
      title: title,
      content: content,
    };

    const createdPostData = await createPostToDatabase(post);

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

export async function validateCommentInput(
  commentContentInput,
  errorMsg,
  postID,
  author
) {
  const commentContent = commentContentInput.value.trim();

  if (commentContent === "") {
    errorMsg.innerHTML = "Comment cannot be empty";
    errorMsg.style.display = "block";
    errorMsg.style.marginTop = "0.625rem";
    errorMsg.style.marginLeft = "0.625rem";
  } else if (commentContent.length > 200) {
    errorMsg.innerHTML = "Comment cannot exceed 200 characters";
    errorMsg.style.display = "block";
    errorMsg.style.marginTop = "0.625rem";
    errorMsg.style.marginLeft = "0.625rem";
  } else {
    errorMsg.innerHTML = "";
    errorMsg.style.display = "none";

    const comment = {
      post_id: postID,
      author: author,
      content: commentContent,
      created_at: new Date().toISOString(),
    };

    createCommentToDatabase(comment);

    let contentContainer = document.getElementById("content-container");

    if (!contentContainer) {
      const postViewContainer = document.createElement("div");
      postViewContainer.setAttribute("id", "post-view-container");

      contentContainer = document.createElement("div");
      contentContainer.setAttribute("id", "content-container");

      postViewContainer.append(contentContainer);
      const root = document.querySelector("#app");
      root.append(postViewContainer);
    }

    const commentComponent = createCommentComponent(comment);
    contentContainer.append(commentComponent);

    commentContentInput.value = "";
  }
}

export async function validateRegisterFormData(
  usernameInput,
  firstNameInput,
  lastNameInput,
  emailInput,
  ageInput,
  maleCheckbox,
  femaleCheckbox,
  passwordInput,
  errorMsg
) {
  const username = usernameInput.value.trim();
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = emailInput.value.trim();
  const age = ageInput.value.trim();
  const male = maleCheckbox.checked;
  const female = femaleCheckbox.checked;
  const password = passwordInput.value.trim();

  // Validate the data
  if (username === "") {
    errorMsg.innerHTML = "Username cannot be empty";
    errorMsg.style.display = "block";
    errorMsg.style.marginBottom = "0.625rem";
    errorMsg.style.marginLeft = "0.625rem";
  } else if (username.length < 2 || username.length > 15) {
    errorMsg.innerHTML =
      "Username must be between 2 and 15 characters in length";
    errorMsg.style.display = "block";
    errorMsg.style.marginBottom = "0.625rem";
    errorMsg.style.marginLeft = "0.625rem";
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errorMsg.innerHTML =
      "Username can only contain letters, numbers, and underscores";
    errorMsg.style.display = "block";
    errorMsg.style.marginBottom = "0.625rem";
    errorMsg.style.marginLeft = "0.625rem";
  } else if (firstName === "") {
    errorMsg.innerHTML = "First name cannot be empty";
    errorMsg.style.display = "block";
    errorMsg.style.marginBottom = "0.625rem";
    errorMsg.style.marginLeft = "0.625rem";
  } else if (lastName === "") {
    errorMsg.innerHTML = "Last name cannot be empty";
    errorMsg.style.display = "block";
    errorMsg.style.marginBottom = "0.625rem";
    errorMsg.style.marginLeft = "0.625rem";
  } else if (email === "") {
    errorMsg.innerHTML = "Email cannot be empty";
    errorMsg.style.display = "block";
    errorMsg.style.marginBottom = "0.625rem";
    errorMsg.style.marginLeft = "0.625rem";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errorMsg.innerHTML = "Invalid email format";
    errorMsg.style.display = "block";
    errorMsg.style.marginBottom = "0.625rem";
    errorMsg.style.marginLeft = "0.625rem";
  } else if (age === "") {
    errorMsg.innerHTML = "Age cannot be empty";
    errorMsg.style.display = "block";
    errorMsg.style.marginBottom = "0.625rem";
    errorMsg.style.marginLeft = "0.625rem";
  } else if (isNaN(age) || parseInt(age) < 0) {
    errorMsg.innerHTML = "Invalid age";
    errorMsg.style.display = "block";
    errorMsg.style.marginBottom = "0.625rem";
    errorMsg.style.marginLeft = "0.625rem";
  } else if (!male && !female) {
    errorMsg.innerHTML = "Please select your gender";
    errorMsg.style.display = "block";
    errorMsg.style.marginBottom = "0.625rem";
    errorMsg.style.marginLeft = "0.625rem";
  } else if (password === "") {
    errorMsg.innerHTML = "Password cannot be empty";
    errorMsg.style.display = "block";
    errorMsg.style.marginBottom = "0.625rem";
    errorMsg.style.marginLeft = "0.625rem";
  } else if (password.length < 6 || password.length > 30) {
    errorMsg.innerHTML =
      "Password must be between 6 and 30 characters in length";
    errorMsg.style.display = "block";
    errorMsg.style.marginBottom = "0.625rem";
    errorMsg.style.marginLeft = "0.625rem";
  } else {
    errorMsg.innerHTML = "";
    errorMsg.style.display = "none";
    errorMsg.style.marginTop = "0";
    errorMsg.style.marginLeft = "0";

    const gender = male ? "Male" : "Female";
    const user = {
      username: username,
      first_name: firstName,
      last_name: lastName,
      email: email,
      age: age,
      gender: gender,
      password: password,
    };

    try {
      const response = await registerUser(user);

      if (response.error) {
        errorMsg.innerHTML = response.error;
        errorMsg.style.display = "block";
        return false;
      }

      return true;
    } catch (error) {
      errorMsg.textContent =
        error.message || "Registration failed. Please try again.";
      errorMsg.style.marginBottom = "0.625rem";
      errorMsg.style.display = "block";
      return false;
    }
  }
}

export async function validateLoginFormInput(
  usernameOrEmailInput,
  passwordInput
) {
  const usernameOrEmail = usernameOrEmailInput.value.trim();
  const password = passwordInput.value.trim();
  const errorMsg = document.querySelector(".error-msg");

  // Validate the data
  if (usernameOrEmail === "") {
    errorMsg.innerHTML = "Username or email cannot be empty";
    errorMsg.style.marginBottom = "0.625rem";
    errorMsg.style.display = "block";
  } else if (password === "") {
    errorMsg.innerHTML = "Password cannot be empty";
    errorMsg.style.marginBottom = "0.625rem";
    errorMsg.style.display = "block";
  } else {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameOrEmail);

    if (isEmail) {
      console.log("Email login:", usernameOrEmail);
      // Login with email
      const user = {
        email: usernameOrEmail,
        password: password,
      };

      try {
        await loginUser(user);
        errorMsg.innerHTML = "";
        errorMsg.style.display = "none";
      } catch (error) {
        errorMsg.innerHTML = error.message;
        errorMsg.style.marginBottom = "0.625rem";
        errorMsg.style.display = "block";
      }
    } else {
      console.log("Username login:", usernameOrEmail);
      // Login with username
      const user = {
        username: usernameOrEmail,
        password: password,
      };

      try {
        await loginUser(user);
        errorMsg.innerHTML = "";
        errorMsg.style.display = "none";
      } catch (error) {
        errorMsg.innerHTML = error.message;
        errorMsg.style.marginBottom = "0.625rem";
        errorMsg.style.display = "block";
      }
    }
  }
}
