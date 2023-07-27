import { convertTime } from "../utils/timeConverter.js";

export function createCommentInputComponent() {
  const commentContainer = document.createElement("div");
  commentContainer.classList.add("comment-input-container");

  // Create the form
  const form = document.createElement("form");
  form.classList.add("form");

  // Create the content field
  const commentContent = document.createElement("textarea");
  commentContent.classList.add("comment-input");
  commentContent.setAttribute("type", "text");
  commentContent.setAttribute("rows", "3");

  const errorMsg = document.createElement("p");
  errorMsg.classList.add("error-msg");
  errorMsg.style.display = "none";

  // Create the comment button
  const commentButton = document.createElement("button");
  commentButton.classList.add("comment-button");
  commentButton.textContent = "Comment";
  commentButton.addEventListener("click", (e) => {
    e.preventDefault;
    // console.log("Comment button clicked");
  });

  form.append(commentContent, errorMsg);

  commentContainer.append(form, commentButton);

  return commentContainer;
}

export function createCommentComponent(comment) {
  const commentComponent = document.createElement("div");
  commentComponent.classList.add("comment-component");

  // Set the post ID as a data attribute
  commentComponent.setAttribute("data-post-id", comment.postId);

  // Set the comment ID as a data attribute
  commentComponent.setAttribute("data-comment-id", comment.id);

  // Displaying the author's name
  const author = document.createElement("p");
  author.classList.add("author");
  author.textContent = comment.author;
  commentComponent.append(author);

  // Displaying the comment content
  const commentContent = document.createElement("p");
  commentContent.classList.add("comment");
  commentContent.textContent = comment.content;
  commentComponent.append(commentContent);

  // Displaying the comment creation date and time
  const createdAt = document.createElement("p");
  createdAt.classList.add("created-at");
  createdAt.textContent = convertTime(comment.createdAt);
  commentComponent.append(createdAt);

  return commentComponent;
}
