import { createFormComponent } from "./components/form.js";
import { readPostsFromDatabase } from "./api/api.js";
import { createPostComponent } from "./components/posts.js";
import { showSinglePost } from "./components/singlePost.js";

async function renderPosts() {
  const root = document.getElementById("app");
  root.innerHTML = "";

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

  window.addEventListener("popstate", (e) => {
    if (e.state && e.state.postId) {
      const postId = e.state.postId;
      showSinglePost({ id: postId });
    } else {
      renderPosts();
    }
  });

  contentContainer.append(formAndPostsContainer);
  root.append(pageTitle, contentContainer);
}

// Call the renderPosts function to initialize the page
renderPosts();

export { renderPosts };
