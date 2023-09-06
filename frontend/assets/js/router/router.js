import { createBaseView } from "../views/BaseView.js";
import { routes } from "./routes.js";

const pathToRegex = (path) =>
  new RegExp(
    "^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "([^\\/]+)") + "$"
  );

const getParams = (match) => {
  const values = match.result.slice(1);

  const parameterNames = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(
    (result) => result[1]
  );

  return Object.fromEntries(
    parameterNames.map((parameterName, i) => {
      return [parameterName, values[i]];
    })
  );
};

export const navigateTo = (url) => {
  history.pushState(null, null, url);
  router();
};

export const router = async () => {
  const potentialMatches = routes.map((route) => {
    return {
      route: route,
      result: location.pathname.match(pathToRegex(route.path)),
    };
  });

  const matchedRoute = potentialMatches.find(
    (potentialMatch) => potentialMatch.result !== null
  );

  if (!matchedRoute) {
    appContainer.innerHTML = "404 Page Not Found";
    return;
  }

  const matchedView = matchedRoute.route.view;
  const params = await getParams(matchedRoute);

  createBaseView(params, matchedView);
};

window.addEventListener("popstate", () => {
  router();
});
