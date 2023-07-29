import { fetchPosts } from "../api/api.js"; // Import the fetchPosts function
import { createFormComponent } from "../components/form.js";
import { createPostComponent } from "../components/post.js";

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

  // Adjust the content-container width based on the messenger visibility state
  contentContainer.style.width = messengerVisible ? "60%" : "80%";

  root.append(contentContainer);
}
