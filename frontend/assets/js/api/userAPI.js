const USERS_API = "http://localhost:8081/api/users";
const USER_API = "http://localhost:8081/api/user/";

export async function fetchUsers() {
  return fetch(USERS_API, {
    mode: "cors",
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error fetching users");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error fetching users:", error);
      return [];
    });
}

export async function fetchSingleUser(userID) {
  return fetch(USER_API, {
    method: "GET",
    mode: "cors",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": userID,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error fetching user:", error);
      return null;
    });
}
