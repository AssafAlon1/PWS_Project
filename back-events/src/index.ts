import { createServer, IncomingMessage, ServerResponse } from "http";
import { URL } from "url";
import * as dotenv from "dotenv";

// import with .js, and not ts.
// for more info: https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#type-in-package-json-and-new-extensions
import { mainRoute, createRoute, getEventById, getEventByOrganizer, getEventByCategory, notFoundRoute, createEvent, deleteEvent, updateEvent } from "./routes.js";
import { Routes } from "./types.js";
import { loginRoute, signupRoute, updatePrivilegesRoute } from "./auth.js";
import { isCategoryValid } from "./utils.js";

dotenv.config();

const port = process.env.PORT || 3000;

const serverHandler = (req: IncomingMessage, res: ServerResponse): void => {
  if (!req.url || !req.method) {
    console.error("Received request without URL or method");
    return;
  }
  const route = createRoute(req.url, `http://${req.headers.host}`, req.method);
  console.log(route);
  switch (route) {
    // Handle event requests
    case Routes["GET_EVENT"]:
      const url = new URL(req.url, `http://${req.headers.host}`);
      const urlLastPart = url.pathname.split("/").pop();

      if (isCategoryValid(urlLastPart)) {
        getEventByCategory(req, res);
      } else {
        getEventById(req, res);
      }
      break;

    case Routes["GET_EVENT_ORG"]:
      getEventByOrganizer(req, res);
      break;

    case Routes["POST_EVENT"]:
      createEvent(req, res);
      break;

    case Routes["UPDATE_EVENT"]:
      updateEvent(req, res);
      break;

    case Routes["DELETE_EVENT"]:
      deleteEvent(req, res);
      break;


    // Handle user requests
    case Routes["LOGIN"]:
      loginRoute(req, res);
      break;

    case Routes["SIGNUP"]:
      signupRoute(req, res);
      break;

    case Routes["UPDATE_PRIVILEGES"]:
      updatePrivilegesRoute(req, res);
      break;

    // Handle home request
    case Routes["GET_HOME"]:
      mainRoute(req, res);
      break;

    // Default is not found
    default:
      notFoundRoute(req, res);
      break;
  }
};

const server = createServer(serverHandler);

server.listen(port);
console.log(`Server running! port ${port}`);
