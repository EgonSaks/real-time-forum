import { deletePostFromDatabase, fetchPosts } from "../api/postAPI.js";
import { createCommentFormComponent } from "../components/comment.js";
import { createPostComponent } from "../components/post.js";
import { navigateTo } from "../router/router.js";

// PostView function with messengerVisible parameter
export async function PostView(_, messengerVisible) {
  const urlParts = window.location.href.split("/");
  const id = urlParts[urlParts.length - 1];

  // Get the data using fetchPosts function
  const data = await fetchPosts();

  // Find the post with matching id
  const singlePost = data.find((post) => post.id === id);

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

  // const comments = await fetchComments();
  // console.log("comments from single post", comments);

  // if (comments) {
  //   const contentContainer = document.getElementById("content-container");
  //   const commentComponent = updateCommentsView(comments);

  //   contentContainer.append(commentComponent);
  // }

  // Clear the existing posts
  contentContainer.innerHTML = "";

  // If there is a matching post, create the post component for the single post
  if (singlePost) {
    const postComponent = createPostComponent(singlePost);

    const deleteButton = postComponent.querySelector(".delete-button");

    deleteButton.addEventListener("click", async (e) => {
      e.preventDefault();
      const postId = singlePost.id;
      await deletePostFromDatabase(postId);
      navigateTo("/");
    });

    const postTitle = postComponent.querySelector(".post-title");
    postTitle.style.cursor = "default";

    const commentForm = createCommentFormComponent(singlePost.id);

    contentContainer.append(postComponent, commentForm);
  } else {
    const errorMessage = document.createElement("p");
    errorMessage.textContent = "No post found.";
    contentContainer.append(errorMessage);
  }

  // Adjust the content-container width based on the messenger visibility state
  contentContainer.style.width = messengerVisible ? "60%" : "80%";
}
