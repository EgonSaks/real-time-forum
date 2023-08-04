import { createPostFormComponent, getPosts } from "../components/post.js";

export async function HomeView(_, messengerVisible) {
  const root = document.querySelector("#app");

  root.innerHTML = "";

  const contentContainer = document.createElement("div");
  contentContainer.setAttribute("id", "content-container");

  const formAndPostContainer = document.createElement("div");
  formAndPostContainer.setAttribute("id", "form-and-post-container");

  const formComponent = createPostFormComponent();
  formAndPostContainer.append(formComponent);

  await getPosts(formAndPostContainer);

  contentContainer.append(formAndPostContainer);

  contentContainer.style.width = messengerVisible ? "60%" : "80%";

  root.append(contentContainer);
}
