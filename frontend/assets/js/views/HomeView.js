import { createPostFormComponent, getPosts } from "../components/post.js";

// HomeView function with messengerVisible parameter
export async function HomeView(_, messengerVisible) {
  // Get the element with the ID "app" from the HTML (the container for our views)
  const root = document.querySelector("#app");

  // Clear the app container to remove any previous content
  root.innerHTML = "";

  // Create a container to hold the main content
  const contentContainer = document.createElement("div");
  contentContainer.setAttribute("id", "content-container");

  // Create the form and post container
  const formAndPostContainer = document.createElement("div");
  formAndPostContainer.setAttribute("id", "form-and-post-container");

  // Create the form component
  const formComponent = createPostFormComponent();
  formAndPostContainer.append(formComponent);

  await getPosts(formAndPostContainer);

  // Append the form and post container to the content container
  contentContainer.append(formAndPostContainer);

  // Adjust the content-container width based on the messenger visibility state
  contentContainer.style.width = messengerVisible ? "60%" : "80%";

  root.append(contentContainer);
}
