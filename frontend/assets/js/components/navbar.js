export function createNavbar() {
  // Create the navbar container
  const navbarContainer = document.createElement("div");
  navbarContainer.classList.add("navbar");

  const loggedInUser = "John Doe";

  // Create the "Logged in as" label
  const loggedInLabel = document.createElement("span");
  loggedInLabel.textContent = `${loggedInUser}`;
  loggedInLabel.classList.add("logged-in-label");

  // Create the logout button
  const logoutButton = document.createElement("button");
  logoutButton.textContent = "❌"; 
  logoutButton.classList.add("logout-button");

  // Add a click event listener to the logout button
  logoutButton.addEventListener("click", () => {
    console.log("Logout button clicked");
    // Add your logout functionality here
  });

  // Append the "Logged in as" label and logout button to the navbar container
  navbarContainer.append(loggedInLabel, logoutButton);

  // Return the navbar container
  return navbarContainer;
}
