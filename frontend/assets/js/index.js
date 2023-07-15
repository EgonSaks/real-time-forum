import { createFormComponent } from "./components/form.js";
import { readPostsFromDatabase } from "./api/api.js";
import { router } from "./router/router.js";
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

  contentContainer.append(formAndPostsContainer);
  root.append(pageTitle, contentContainer);
}

function handleHistoryNavigation() {
  const postId = window.location.hash;

  if (postId) {
    showSinglePost({ id: postId });
  } else {
    renderPosts();
  }
}

window.addEventListener("popstate", handleHistoryNavigation);

router.start();

export { renderPosts };
