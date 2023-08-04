import { navigateTo } from "../router/router.js";

const LOGOUT_API = "http://localhost:8081/logout";

export async function logoutUser() {
  fetch(LOGOUT_API, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => {
      if (response.ok) {
        localStorage.removeItem("user");
        navigateTo("/login");
      } else {
        console.error("Logout error:", response.statusText);
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}
