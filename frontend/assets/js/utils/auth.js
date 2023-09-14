import { fetchSession } from "../api/sessionAPI.js";
import { fetchSingleUser } from "../api/userAPI.js";

export async function isLoggedIn() {
  const cookie = await getCookie();

  if (!cookie) {
    return { isLoggedIn: false, data: "" };
  }

  const session = await fetchSession(cookie);

  if (!session || !session.user_id) {
    return { isLoggedIn: false, data: "" };
  }
  const user = await fetchSingleUser(session.user_id);

  if (user) {
    return { isLoggedIn: true, ...user };
  } else {
    return { isLoggedIn: false, data: "" };
  }
}

async function getCookie() {
  const cookie = document.cookie
    .split(";")
    .filter((item) => item.includes("session="));
  let sessionId = null;

  if (cookie.length > 0) {
    const sessionCookie = cookie[0];
    sessionId = sessionCookie.split("=")[1].trim();
  }

  return sessionId;
}
