export function isLoggedIn() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user && user.expiresAt > new Date().getTime()) {
    return { isLoggedIn: true, ...user };
  } else {
    localStorage.removeItem("user");
    return { isLoggedIn: false, data: "" };
  }
}


