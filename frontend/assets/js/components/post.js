import {
  deletePostFromDatabase,
  fetchPosts,
  updatePostData,
} from "../api/postAPI.js";
import { navigateTo } from "../router/router.js";
import { countCharacters } from "../utils/characterCount.js";
import { convertTime } from "../utils/timeConverter.js";
import {
  validatePostInput,
  validateUpdatedData,
} from "../validators/inputValidations.js";

const categories = ["Tech", "Finance", "Health", "Startup", "Innovation"];

export function createPostFormComponent() {
  const formContainer = document.createElement("div");
  formContainer.classList.add("form-container");

  const form = document.createElement("form");
  form.classList.add("form");

  const inputTitle = document.createElement("input");
  inputTitle.classList.add("input-title");
  inputTitle.setAttribute("type", "text");
  inputTitle.setAttribute("placeholder", "Title:");

  const inputContent = document.createElement("textarea");
  inputContent.classList.add("input-content");
  inputContent.setAttribute("rows", "5");
  inputContent.setAttribute("placeholder", "What is happening?!");
  inputContent.addEventListener("input", countCharacters);

  const charCountSpan = document.createElement("span");
  charCountSpan.classList.add("character-count");
  charCountSpan.textContent = "";

  const errorMsg = document.createElement("p");
  errorMsg.classList.add("error-msg");
  errorMsg.style.display = "none";

  const postButton = document.createElement("button");
  postButton.classList.add("post-button");
  postButton.setAttribute("type", "submit");
  postButton.textContent = "Post";

  const categoriesContainer = document.createElement("div");
  categoriesContainer.classList.add("categories-container");

  const maxCategories = 3;
  let selectedCount = 0;
  let selectedCategories = [];

  categories.forEach((category) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "category";
    checkbox.value = category;
    checkbox.id = category;

    const label = document.createElement("label");
    label.htmlFor = category;
    label.appendChild(document.createTextNode(category));

    checkbox.addEventListener("change", function () {
      if (this.checked) {
        selectedCount++;
        selectedCategories.push(this.value);
      } else {
        selectedCount--;
        const index = selectedCategories.indexOf(this.value);
        if (index > -1) {
          selectedCategories.splice(index, 1);
        }
      }

      categoriesContainer
        .querySelectorAll('input[type="checkbox"]')
        .forEach((box) => {
          if (selectedCount >= maxCategories && !box.checked) {
            box.disabled = true;
            box.classList.add("disabled");
          } else {
            box.disabled = false;
            box.classList.remove("disabled");
          }
        });
    });

    categoriesContainer.append(checkbox, label);
  });

  postButton.addEventListener("click", async function (e) {
    e.preventDefault();
    await validatePostInput(
      inputTitle,
      inputContent,
      selectedCategories,
      errorMsg,
      categoriesContainer
    );
    charCountSpan.textContent = "";
  });

  form.append(inputTitle, inputContent, categoriesContainer, errorMsg);
  formContainer.append(form, postButton, charCountSpan);

  return formContainer;
}

export function createPostComponent(post) {
  const postContainer = document.createElement("div");
  postContainer.classList.add("post-container");
  postContainer.setAttribute("id", post.id);

  const postTitle = document.createElement("h2");
  postTitle.classList.add("post-title");
  postTitle.textContent = post.title;
  postTitle.addEventListener("click", () => {
    navigateTo("/post/" + post.id);
  });

  const author = document.createElement("p");
  author.classList.add("author");
  author.textContent = post.author;

  const postContent = document.createElement("p");
  postContent.classList.add("post-content");
  postContent.textContent = post.content;

  const categoriesContainer = document.createElement("div");
  categoriesContainer.classList.add("post-categories-container");

  post.categories.forEach((category) => {
    const categoryLabel = document.createElement("span");
    categoryLabel.classList.add("category-label");
    categoryLabel.textContent = category;
    categoriesContainer.appendChild(categoryLabel);
  });

  const createdAt = document.createElement("p");
  createdAt.classList.add("created-at");
  createdAt.textContent = convertTime(post.created_at);

  const editButton = document.createElement("button");
  editButton.classList.add("edit-button");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    const postId = post.id;
    editPost(postId);
  });

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    const postId = post.id;
    deletePostFromDatabase(postId);
    postContainer.remove();
  });

  postContainer.append(
    author,
    postTitle,
    postContent,
    categoriesContainer,
    createdAt,
    editButton,
    deleteButton
  );
  return postContainer;
}

export async function getPosts(formAndPostContainer) {
  const data = await fetchPosts();

  data.forEach((post) => {
    const postComponent = createPostComponent(post);
    formAndPostContainer.append(postComponent);
  });
}

export function editPost(postId) {
  const postContainer = document.getElementById(postId);
  const postTitle = postContainer.querySelector(".post-title");
  const postContent = postContainer.querySelector(".post-content");

  const author = postContainer.querySelector(".author");
  const createdAt = postContainer.querySelector(".created-at");

  const existingCategories = Array.from(
    postContainer.querySelectorAll(".category-label")
  ).map((category) => category.textContent);

  const title = postTitle.textContent;
  const content = postContent.textContent;

  const editButton = postContainer.querySelector(".edit-button");
  const deleteButton = postContainer.querySelector(".delete-button");

  editButton.remove();
  deleteButton.remove();
  postTitle.remove();
  postContent.remove();

  const existingCategoriesContainer = postContainer.querySelector(
    ".post-categories-container"
  );
  existingCategoriesContainer.remove();

  const form = document.createElement("form");
  form.classList.add("form");

  const inputTitle = document.createElement("input");
  inputTitle.classList.add("input-title");
  inputTitle.setAttribute("type", "text");
  inputTitle.setAttribute("value", title);

  const inputContent = document.createElement("textarea");
  inputContent.classList.add("input-content");
  inputContent.setAttribute("rows", "3");
  inputContent.textContent = content;

  const categoriesForm = createCategoriesForm(existingCategories);

  const errorMsg = document.createElement("p");
  errorMsg.classList.add("error-msg");
  errorMsg.style.display = "none";

  const updateButton = document.createElement("button");
  updateButton.classList.add("update-button");
  updateButton.textContent = "Update";

  updateButton.addEventListener("click", (e) => {
    e.preventDefault();
    const selectedCategories = Array.from(
      form.querySelectorAll('input[name="category"]:checked')
    ).map((input) => input.value);
    updatePostInDatabase(postId, selectedCategories);
  });

  const discardButton = document.createElement("button");
  discardButton.classList.add("discard-button");
  discardButton.textContent = "Discard";

  discardButton.addEventListener("click", () => {
    postContainer.innerHTML = "";
    const restoredCategoriesContainer = document.createElement("div");
    restoredCategoriesContainer.classList.add("post-categories-container");

    existingCategories.forEach((category) => {
      const categoryLabel = document.createElement("span");
      categoryLabel.classList.add("category-label");
      categoryLabel.textContent = category;
      restoredCategoriesContainer.appendChild(categoryLabel);
    });

    postContainer.append(
      author,
      postTitle,
      postContent,
      restoredCategoriesContainer,
      createdAt,
      editButton,
      deleteButton
    );
  });

  form.append(inputTitle, inputContent, categoriesForm, errorMsg);
  postContainer.append(author, form, createdAt, updateButton, discardButton);
}

// export function updatePostElement(post, postContainer) {
//   const author = postContainer.querySelector(".author");
//   const createdAt = postContainer.querySelector(".created-at");

//   const postTitle = document.createElement("h2");
//   postTitle.classList.add("post-title");
//   postTitle.textContent = post.title;
//   postTitle.addEventListener("click", () => {
//     navigateTo("/post/" + post.id);
//   });

//   const postContent = document.createElement("p");
//   postContent.classList.add("post-content");
//   postContent.textContent = post.content;

//   postContainer.innerHTML = "";
//   postContainer.append(author, postTitle, postContent, createdAt);

//   const editButton = document.createElement("button");
//   editButton.classList.add("edit-button");
//   editButton.textContent = "Edit";
//   editButton.addEventListener("click", () => {
//     const postId = post.id;
//     editPost(postId);
//   });

//   const deleteButton = document.createElement("button");
//   deleteButton.classList.add("delete-button");
//   deleteButton.textContent = "Delete";
//   deleteButton.addEventListener("click", () => {
//     const postId = post.id;
//     deletePostFromDatabase(postId);
//     postContainer.remove();

//     navigateTo("/");
//   });

//   postContainer.append(editButton, deleteButton);
// }
export function updatePostElement(post, postContainer) {
  const author = postContainer.querySelector(".author");
  const createdAt = postContainer.querySelector(".created-at");

  const postTitle = document.createElement("h2");
  postTitle.classList.add("post-title");
  postTitle.textContent = post.title;
  postTitle.addEventListener("click", () => {
    navigateTo("/post/" + post.id);
  });

  const postContent = document.createElement("p");
  postContent.classList.add("post-content");
  postContent.textContent = post.content;

  const categoriesContainer = document.createElement("div");
  categoriesContainer.classList.add("post-categories-container");
  post.categories.forEach((category) => {
    const categoryLabel = document.createElement("span");
    categoryLabel.classList.add("category-label");
    categoryLabel.textContent = category;
    categoriesContainer.appendChild(categoryLabel);
  });

  const editButton = document.createElement("button");
  editButton.classList.add("edit-button");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    editPost(post.id);
  });

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    deletePostFromDatabase(post.id);
    postContainer.remove();
    navigateTo("/");
  });

  postContainer.innerHTML = "";

  postContainer.append(
    author,
    postTitle,
    postContent,
    categoriesContainer,
    createdAt,
    editButton,
    deleteButton
  );
}

export async function updatePostInDatabase(postId, selectedCategories) {
  const postContainer = document.getElementById(postId);
  const errorMsg = postContainer.querySelector(".error-msg");

  const inputTitle = postContainer.querySelector(".input-title");
  const inputContent = postContainer.querySelector(".input-content");

  const id = postContainer.id;
  const title = inputTitle.value.trim();
  const content = inputContent.value.trim();

  const isValidData = validateUpdatedData(
    title,
    content,
    selectedCategories,
    errorMsg,
    postContainer
  );

  if (isValidData) {
    const updatedData = {
      id: id,
      title: title,
      content: content,
      categories: selectedCategories,
    };

    const updateData = await updatePostData(updatedData, postContainer);
    updatePostElement(updateData, postContainer);
  }
}

export function updatePostsView(posts) {
  const formAndPostContainer = document.getElementById(
    "form-and-post-container"
  );

  const existingPostContainers =
    formAndPostContainer.querySelectorAll(".post-container");

  const updatedPostIds = new Set(posts.map((post) => post.id));

  existingPostContainers.forEach((postContainer) => {
    const postId = postContainer.id.trim;

    if (!updatedPostIds.has(postId)) {
      postContainer.remove();
    }
  });

  posts.forEach((post) => {
    const postComponent = createPostComponent(post);
    formAndPostContainer.append(postComponent);
  });
}

function createCategoriesForm(selectedCategories = []) {
  const categoriesContainer = document.createElement("div");
  categoriesContainer.classList.add("categories-container");

  const maxCategories = 3;
  let selectedCount = selectedCategories.length;

  categories.forEach((category) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "category";
    checkbox.value = category;
    checkbox.id = category;

    const label = document.createElement("label");
    label.htmlFor = category;
    label.appendChild(document.createTextNode(category));

    if (selectedCategories.includes(category)) {
      checkbox.checked = true;
    }

    if (selectedCount >= maxCategories && !checkbox.checked) {
      checkbox.disabled = true;
      checkbox.classList.add("disabled");
    }

    checkbox.addEventListener("change", function () {
      if (this.checked) {
        selectedCount++;
      } else {
        selectedCount--;
      }

      categoriesContainer
        .querySelectorAll('input[type="checkbox"]')
        .forEach((box) => {
          if (selectedCount >= maxCategories && !box.checked) {
            box.disabled = true;
            box.classList.add("disabled");
          } else {
            box.disabled = false;
            box.classList.remove("disabled");
          }
        });
    });

    categoriesContainer.append(checkbox, label);
  });

  return categoriesContainer;
}
