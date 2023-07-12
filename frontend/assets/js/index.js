import { createFormComponent } from "./components/form.js";
import { readPostsFromDatabase } from "./api/api.js";
import { createPostComponent } from "./components/posts.js";
import { showSinglePost } from "./components/singlePost.js";

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

export { renderPosts };
