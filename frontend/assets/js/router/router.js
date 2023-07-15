import { renderPosts } from "../index.js";
// Define the router object
const router = {
  routes: [],

  // Add a route and its corresponding handler
  addRoute(path, handler) {
    this.routes.push({ path, handler });
  },

  // Handle the current route
  handleRoute() {
    const currentPath = window.location.pathname;

    for (const route of this.routes) {
      if (route.path === currentPath) {
        route.handler();
        return;
      }
    }

    // If no matching route found, handle a 404 case
    this.handle404();
  },

  // Handle a 404 route
  handle404() {
    console.log("404 - Not Found");
    // You can display a custom 404 page or redirect to a specific URL
  },

  // Start listening for route changes
  start() {
    // Handle initial route on page load
    this.handleRoute();

    // Listen for route changes using the History API
    window.addEventListener("popstate", () => {
      this.handleRoute();
    });
  },
};

// Usage example
router.addRoute("/", () => {
  renderPosts();
  console.log("Home Page");
});

router.addRoute("/about", () => {
  console.log("About Page");
});

router.addRoute("/contact", () => {
  console.log("Contact Page");
});

// Start the router
// router.start();

export { router };
