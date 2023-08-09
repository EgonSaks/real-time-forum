import { fetchCommentsByPostID } from "../api/commentAPI.js";
import {
  deletePostFromDatabase,
  fetchPosts,
  fetchSinglePost,
} from "../api/postAPI.js";
import {
  createCommentFormComponent,
  updateCommentsView,
} from "../components/comment.js";
import { createPostComponent, updatePostsView } from "../components/post.js";
import { navigateTo } from "../router/router.js";

export async function PostView(_, messengerVisible) {
  const urlParts = window.location.href.split("/");
  const id = urlParts[urlParts.length - 1];

  const post = await fetchSinglePost(id);
  const comment = await fetchCommentsByPostID(id);

  const author = comment.length > 0 ? comment[0].author : null;

  let contentContainer = document.getElementById("content-container");

  if (!contentContainer) {
    const postViewContainer = document.createElement("div");
    postViewContainer.setAttribute("id", "post-view-container");

    contentContainer = document.createElement("div");
    contentContainer.setAttribute("id", "content-container");

    postViewContainer.append(contentContainer);

    const root = document.querySelector("#app");
    root.append(postViewContainer);
  }

  contentContainer.innerHTML = "";

  if (post) {
    const commentForm = createCommentFormComponent(post.id, author);
    const postContainer = createPostComponent(post);

    const postTitle = postContainer.querySelector(".post-title");
    const postTitleClone = postTitle.cloneNode(true);
    postTitle.replaceWith(postTitleClone);
    postTitleClone.style.cursor = "default";

    const deleteButton = postContainer.querySelector(".delete-button");
    deleteButton.addEventListener("click", async () => {
      await deletePostFromDatabase(post.id);
      console.log("post deleted");

      postContainer.remove();

      const updatedPosts = await fetchPosts();
      const postExistsInHomeView = updatedPosts.some((p) => p.id === post.id);

      if (!postExistsInHomeView) {
        navigateTo("/");
      } else {
        updatePostsView(updatedPosts);
      }
    });

    contentContainer.append(postContainer, commentForm);
    updateCommentsView(comment, contentContainer);
  } else {
    const errorMessage = document.createElement("p");
    errorMessage.textContent = "No post found.";
    contentContainer.append(errorMessage);
  }

  contentContainer.style.width = messengerVisible ? "60%" : "80%";
}
