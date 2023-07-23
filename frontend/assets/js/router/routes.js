import { HomeView } from "../views/HomeView.js";
import { Login } from "../views/Login.js";
import { PostView } from "../views/PostView.js";
import { Register } from "../views/Register.js";

export const routes = [
  { path: "/register", view: Register },
  { path: "/login", view: Login },
  { path: "/", view: HomeView },
  { path: "/post/:id", view: PostView },
];
