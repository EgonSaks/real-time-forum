import { fetchPosts } from "../api/api.js";
import { createPostComponent } from "../components/post.js";

export async function PostView() {
  // Extract the id from the URL
  console.log("Calling the PostView from url");
  const urlParts = window.location.href.split("/");
  const id = urlParts[urlParts.length - 1];

  // Get the data using fetchPosts function
  const data = await fetchPosts();

  // Find the post with matching id
  const singlePost = data.find((post) => post.id === id);

  // Clear the existing posts
  const contentContainer = document.getElementById("content-container");
  contentContainer.innerHTML = "";

  // If there is a matching post, create the post component for the single post
  if (singlePost) {
    const postComponent = createPostComponent(singlePost);
    contentContainer.append(postComponent);
  } else {
    const errorMessage = document.createElement("p");
    errorMessage.textContent = "No post found.";
    contentContainer.append(errorMessage);
  }
}
