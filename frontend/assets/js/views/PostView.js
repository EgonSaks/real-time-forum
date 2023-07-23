import { fetchPosts } from "../api/api.js";
import { createPostComponent } from "../components/post.js";
export async function PostView() {
  console.log("Calling the PostView from url");
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
    contentContainer = document.createElement("div");
    contentContainer.setAttribute("id", "content-container");

    // Append contentContainer to #app element along with the pageTitle
    const pageTitle = document.createElement("h1");
    pageTitle.classList.add("page-title");
    pageTitle.textContent = "Public room v1.0";

    // Append pageTitle and contentContainer to #app element
    const root = document.querySelector("#app");
    root.append(pageTitle, contentContainer);
  }

  // Clear the existing posts
  contentContainer.innerHTML = "";

  // If there is a matching post, create the post component for the single post
  if (singlePost) {
    const postComponent = createPostComponent(singlePost);
    contentContainer.appendChild(postComponent);
  } else {
    const errorMessage = document.createElement("p");
    errorMessage.textContent = "No post found.";
    contentContainer.appendChild(errorMessage);
  }
}
