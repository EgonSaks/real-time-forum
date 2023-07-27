import { deletePostFromDatabase, fetchPosts } from "../api/api.js";
import { createChatContainer } from "../components/chat.js";
import {
  createCommentComponent,
  createCommentInputComponent,
} from "../components/comment.js";
import { createPostComponent } from "../components/post.js";
import { navigateTo } from "../router/router.js";

export async function PostView() {
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

    // Append contentContainer to #app element along with the pageTitle
    const pageTitle = document.createElement("h1");
    pageTitle.classList.add("page-title");
    pageTitle.textContent = "Public room v1.0";

    postViewContainer.append(pageTitle, contentContainer);

    // Create the chat container
    const chatContainer = createChatContainer();

    // Append pageTitle and contentContainer to #app element
    const root = document.querySelector("#app");
    root.append(postViewContainer, chatContainer);
  }

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

    const comments = [
      {
        id: "1",
        content:
          "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor",
        postId: singlePost.id,
        author: "John Doe",
        createdAt: new Date(),
      },
      {
        id: "2",
        content:
          "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor",
        postId: singlePost.id,
        author: "Elon Musk",
        createdAt: new Date(),
      },
      {
        id: "3",
        content:
          "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor",
        postId: singlePost.id,
        author: "Bill Gates",
        createdAt: new Date(),
      },
      {
        id: "4",
        content:
          "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor",
        postId: singlePost.id,
        author: "Steve Jobs",
        createdAt: new Date(),
      },
    ];

    const commentForm = createCommentInputComponent();

    // Use the comments associated with the singlePost
    // const comments = singlePost.comments || [];

    // Append the postComponent and commentForm after adding all the comments
    contentContainer.append(postComponent, commentForm);

    // Loop through comments and create the comment components
    comments.forEach((comment) => {
      const commentComponent = createCommentComponent(comment);
      contentContainer.append(commentComponent);
    });
  } else {
    const errorMessage = document.createElement("p");
    errorMessage.textContent = "No post found.";
    contentContainer.append(errorMessage);
  }
}
