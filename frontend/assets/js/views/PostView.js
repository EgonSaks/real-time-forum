import { fetchSinglePost } from "../api/postAPI.js";
import {
  createCommentFormComponent,
  updateCommentsView,
} from "../components/comment.js";
import { createSinglePostComponent } from "../components/post.js";

// PostView function with messengerVisible parameter
export async function PostView(_, messengerVisible) {
  const urlParts = window.location.href.split("/");
  const id = urlParts[urlParts.length - 1];

  // Get the data object with post and comments
  const post = await fetchSinglePost(id);

  // Fetch the comments for the post
  const comments = post ? post.comments : [];

  // Try to get the existing contentContainer
  let contentContainer = document.getElementById("content-container");

  // If contentContainer doesn't exist, create it and append it to #app
  if (!contentContainer) {
    // Create the contentContainer
    const postViewContainer = document.createElement("div");
    postViewContainer.setAttribute("id", "post-view-container");

    contentContainer = document.createElement("div");
    contentContainer.setAttribute("id", "content-container");

    postViewContainer.append(contentContainer);

    // Append pageTitle and contentContainer to #app element
    const root = document.querySelector("#app");
    root.append(postViewContainer);
  }

  // Clear the existing posts
  contentContainer.innerHTML = "";

  // If there is a matching post, create the post component for the single post
  if (post) {
    const id = post.post.id;
    const commentForm = createCommentFormComponent(id);
    const postComponent = createSinglePostComponent(post);

    const postTitle = postComponent.querySelector(".post-title");
    postTitle.style.cursor = "default";

    contentContainer.append(postComponent, commentForm);
    updateCommentsView(comments, contentContainer);
  } else {
    const errorMessage = document.createElement("p");
    errorMessage.textContent = "No post found.";
    contentContainer.append(errorMessage);
  }

  // Adjust the content-container width based on the messenger visibility state
  contentContainer.style.width = messengerVisible ? "60%" : "80%";
}
