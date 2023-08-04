import { logoutUser } from "../api/logoutAPI.js";

export function createNavbar(user) {
  const navbarContainer = document.createElement("div");
  navbarContainer.classList.add("navbar");

  const loggedInUser = user.username || "John Doe";

  const loggedInLabel = document.createElement("span");
  loggedInLabel.textContent = `${loggedInUser}`;
  loggedInLabel.classList.add("logged-in-label");

  const logoutButton = document.createElement("button");
  logoutButton.textContent = "❌";
  logoutButton.classList.add("logout-button");

  logoutButton.addEventListener("click", () => {
    logoutUser();
  });

  navbarContainer.append(loggedInLabel, logoutButton);

  return navbarContainer;
}
