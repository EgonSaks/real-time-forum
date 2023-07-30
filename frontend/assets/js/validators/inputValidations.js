import { createPostToDatabase, fetchPosts } from "../api/postAPI.js";
import { updateCommentsView } from "../components/comment.js";
import { updatePostsView } from "../components/post.js";
import { createCommentToDatabase } from "../api/commentAPI.js";

// Validate form input
export async function validatePostInput(titleInput, contentInput, errorMsg) {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  // Validate the data
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

    // Prepare the data
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

// Function to validate the updated data
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
  postId
) {
  const commentContent = commentContentInput.value.trim();

  // Validate the data
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

    // Prepare the data
    const comment = {
      post_id: postId,
      content: commentContent,
    };

    console.log("data from validation", comment);
    updateCommentsView(comment);

    // await createCommentToDatabase(comment);

    commentContentInput.value = "";
  }
}
