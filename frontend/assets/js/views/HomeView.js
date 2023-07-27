// import { fetchPosts } from "../api/api.js"; // Import the fetchPosts function
// import { createChatContainer } from "../components/chat.js";
// import { createFormComponent } from "../components/form.js";
// import { createPostComponent } from "../components/post.js";

// export async function HomeView() {
//   // Get the element with the ID "app" from the HTML (the container for our views)
//   const root = document.querySelector("#app");
//   // Clear the app container to remove any previous content
//   root.innerHTML = "";

//   // Create title
//   const pageTitle = document.createElement("h1");
//   pageTitle.classList.add("page-title");
//   pageTitle.textContent = "Public room v1.0";

//   // Create a container to hold the main content
//   const contentContainer = document.createElement("div");
//   contentContainer.setAttribute("id", "content-container");

//   // Create the form and post container
//   const formAndPostContainer = document.createElement("div");
//   formAndPostContainer.setAttribute("id", "form-and-post-container");

//   // Create the form component
//   const formComponent = createFormComponent();
//   formAndPostContainer.append(formComponent);

//   // Get the data using fetchPosts function
//   const data = await fetchPosts();

//   // Create the post components
//   data.forEach((post) => {
//     const postComponent = createPostComponent(post);
//     formAndPostContainer.append(postComponent);
//   });

//   // Append the form and post container to the content container
//   contentContainer.append(formAndPostContainer);

//   // Create the chat container
//   const chatContainer = createChatContainer();

//   // Append the container to the app container to display the content
//   root.append(pageTitle, contentContainer, chatContainer);
// }




import { fetchPosts } from "../api/api.js";
import { createChatContainer } from "../components/chat.js";
import { createFormComponent } from "../components/form.js";
import { createPostComponent } from "../components/post.js";

export async function HomeView() {
  const root = document.querySelector("#app");
  root.innerHTML = "";

  // Create title
  const pageTitle = document.createElement("h1");
  pageTitle.classList.add("page-title");
  pageTitle.textContent = "Public room v1.0";

  // Create the theme toggle switch
  const themeToggle = document.createElement("label");
  themeToggle.classList.add("theme-switch");
  const themeInput = document.createElement("input");
  themeInput.type = "checkbox";
  themeInput.id = "theme-toggle";
  themeToggle.appendChild(themeInput);
  const themeSlider = document.createElement("span");
  themeSlider.classList.add("slider", "round");
  themeToggle.appendChild(themeSlider);

  // Add event listener for theme toggle
  themeInput.addEventListener("change", () => {
    const darkThemeLink = document.querySelector(
      'link[href="/assets/css/dark-theme.css"]'
    );
    if (darkThemeLink) {
      darkThemeLink.disabled = !themeInput.checked;
    }
  });

  // Function to dynamically load the theme stylesheet
  function loadTheme(themeName) {
    const oldThemeLink = document.querySelector("link[data-theme]");
    const newThemeLink = document.createElement("link");
    newThemeLink.setAttribute("rel", "stylesheet");
    newThemeLink.setAttribute("href", `/assets/css/${themeName}`);
    newThemeLink.setAttribute("data-theme", themeName);

    document.head.replaceChild(newThemeLink, oldThemeLink);
  }

  // Create a container to hold the main content
  const contentContainer = document.createElement("div");
  contentContainer.setAttribute("id", "content-container");

  // Create the form and post container
  const formAndPostContainer = document.createElement("div");
  formAndPostContainer.setAttribute("id", "form-and-post-container");

  // Create the form component
  const formComponent = createFormComponent();
  formAndPostContainer.append(formComponent);

  // Get the data using fetchPosts function
  const data = await fetchPosts();

  // Create the post components
  data.forEach((post) => {
    const postComponent = createPostComponent(post);
    formAndPostContainer.append(postComponent);
  });

  // Append the form and post container to the content container
  contentContainer.append(formAndPostContainer);

  // Create the chat container
  const chatContainer = createChatContainer();

  // Append the container to the app container to display the content
  root.append(pageTitle, themeToggle, contentContainer, chatContainer);
}
