// import { editPost } from "../components/post.js";
import { fetchPosts } from "../api/api.js";
import { createPostComponent } from "../components/post.js";

export async function PostView() {
  // Extract the id from the URL
  console.log("Calling the PostView from url");
  const urlParts = window.location.href.split("/");
  const id = urlParts[urlParts.length - 1];

  // Clear the existing posts
  const contentContainer = document.getElementById("content-container");
  contentContainer.innerHTML = "";

  // Get the data using fetchPosts function
  const data = await fetchPosts(); // Using await here since fetchPosts returns a Promise

  // Find the post with matching id
  const singlePost = data.find((post) => post.id === id);

  // If there is a matching post, create the post component for the single post
  if (singlePost) {
    const postComponent = createPostComponent(singlePost);
    contentContainer.append(postComponent);
  }
}
