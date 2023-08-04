import { navigateTo } from "../router/router.js";
const REGISTER_API = "http://localhost:8081/register";

export async function registerUser(user) {
  try {
    const response = await fetch(REGISTER_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
      credentials: "include",
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error);
    }

    navigateTo("/login");
    return responseData;
  } catch (error) {
    throw error;
  }
}
