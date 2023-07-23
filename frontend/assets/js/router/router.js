// Import the list of routes from another file (not shown here)
import { routes } from "./routes.js";

// Function to convert a route path into a regular expression for matching URLs
const pathToRegex = (path) =>
  new RegExp(
    "^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "([^\\/]+)") + "$"
  );

// Function to extract parameters from the matched URL
const getParams = (match) => {
  const values = match.result.slice(1);

  // Get parameter names from the route path using regular expressions
  const parameterNames = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(
    (result) => result[1]
  );

  // Combine parameter names with their corresponding values to create an object
  return Object.fromEntries(
    parameterNames.map((parameterName, i) => {
      return [parameterName, values[i]];
    })
  );
};

// Function to change the URL and trigger the router to update the view
export const navigateTo = (url) => {
  // Change the URL in the browser without refreshing the page
  history.pushState(null, null, url);
  // Call the router function to update the view based on the new URL
  router();
};

export const router = async () => {
  // Test each route to see if it matches the current URL
  const potentialMatches = routes.map((route) => {
    return {
      route: route,
      // Check if the current URL matches the route path (using the previously defined regex)
      result: location.pathname.match(pathToRegex(route.path)),
    };
  });

  // Find the first route that matches the current URL
  const matchedRoute = potentialMatches.find(
    (potentialMatch) => potentialMatch.result !== null
  );

  // Get the element with the ID "app" from the HTML (the container for our views)
  const appContainer = document.querySelector("#app");

  // If no matching route is found, show a "404 Page Not Found" message
  if (!matchedRoute) {
    appContainer.innerHTML = "404 Page Not Found";
    // Stop further execution, as there's no route to show
    return;
  }

  // Get the view function for the matched route and extract parameters
  const matchedView = matchedRoute.route.view;
  const params = await getParams(matchedRoute);

  // Call the matched view function with the extracted parameters
  matchedView(params);
};

window.addEventListener("popstate", () => {
  router();
});
