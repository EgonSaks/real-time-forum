import { isLoggedIn } from "../utils/auth.js";
import { countCharacters } from "../utils/characterCounter.js";
import { convertTime } from "../utils/timeConverter.js";
import { validateCommentInput } from "../validators/inputValidations.js";

export function createCommentFormComponent(postID, author) {
  const commentContainer = document.createElement("div");
  commentContainer.classList.add("comment-input-container");

  const form = document.createElement("form");
  form.classList.add("form");

  const commentContent = document.createElement("textarea");
  commentContent.classList.add("comment-input");
  commentContent.setAttribute("type", "text");
  commentContent.setAttribute("rows", "3");

  const charCountSpan = document.createElement("span");
  charCountSpan.classList.add("character-count");

  commentContent.addEventListener("input", () =>
    countCharacters(charCountSpan, commentContent, 250)
  );

  commentContent.addEventListener("focus", () => {
    charCountSpan.style.display = "inline";
  });

  commentContent.addEventListener("blur", () => {
    charCountSpan.style.display = "none";
  });

  const errorMsg = document.createElement("p");
  errorMsg.classList.add("error-msg");
  errorMsg.style.display = "none";

  const commentButton = document.createElement("button");
  commentButton.classList.add("comment-button");
  commentButton.textContent = "Comment";
  commentButton.addEventListener("click", (e) => {
    e.preventDefault();
    validateCommentInput(commentContent, errorMsg, postID, author);
    charCountSpan.textContent = "";
  });

  form.append(commentContent, errorMsg);

  commentContainer.append(form, commentButton, charCountSpan);

  return commentContainer;
}

export function createCommentComponent(comment) {
  const currentUser = isLoggedIn();
  const commentComponent = document.createElement("div");
  commentComponent.classList.add("comment-component");

  commentComponent.setAttribute("data-post-id", comment.post_id);

  commentComponent.setAttribute("data-comment-id", comment.id);

  const author = document.createElement("p");
  author.classList.add("author");
  author.textContent = comment.author || currentUser.username;
  commentComponent.append(author);

  const commentContent = document.createElement("p");
  commentContent.classList.add("comment");
  commentContent.textContent = comment.content;
  commentComponent.append(commentContent);

  const createdAt = document.createElement("p");
  createdAt.classList.add("created-at");
  createdAt.textContent = convertTime(comment.created_at);
  commentComponent.append(createdAt);

  return commentComponent;
}

export function updateCommentsView(comments, contentContainer) {
  const firstCommentComponent = contentContainer.querySelector(
    ".comment-container:first-child"
  );

  if (comments) {
    comments.forEach((comment) => {
      const commentComponent = createCommentComponent(comment);

      if (firstCommentComponent) {
        contentContainer.insertBefore(commentComponent, firstCommentComponent);
      } else {
        contentContainer.append(commentComponent);
      }
    });
  }
}
