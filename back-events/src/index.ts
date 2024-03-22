import { createServer, IncomingMessage, ServerResponse } from "http";
import { URL } from "url";
import * as dotenv from "dotenv";

// import with .js, and not ts.
// for more info: https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#type-in-package-json-and-new-extensions
import { createRoute, getEventById, notFoundRoute, createEvent, deleteEvent, updateEvent } from "./routes.js";
import { Routes } from "./types.js";

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

      getEventById(req, res);
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

    // Default is not found
    default:
      notFoundRoute(req, res);
      break;
  }
};

const server = createServer(serverHandler);

server.listen(port);
console.log(`Server running! port ${port}`);
