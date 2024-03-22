import { IncomingMessage, ServerResponse } from "http";
import { protectedRoute } from "./auth.js";
import { HTTPError, Routes } from "./types.js";
import { deleteEventByID, insertEvent, queryEventByID, queryEventsByCategory, queryEventsByOrganizer, updateEventByID } from "./db.js";
import { ICSEvent, eventSchema } from "./models/CSEvent.js";
import { parseURL, isHTTPError } from "./utils.js";
import mongoose from "mongoose";


export const createRoute = (baseUrl: string, host: string, method: string): Routes => {
  if (!baseUrl) {
    return Routes["NOT_FOUND"];
  }

  // Strip searchParams from URL
  const pathName = new URL(baseUrl, `http://${host}`).pathname;

  if (method === 'GET' && pathName.match(/^\/api\/event\/[^/]+$/)) {
    return Routes["GET_EVENT"];
  }

  else if (method === 'GET' && pathName.match(/^\/api\/event\/organizer\/[^/]+$/)) {
    return Routes["GET_EVENT_ORG"];
  }

  else if (method == 'POST' && pathName.match(/^\/api\/signup$/)) {
    return Routes["SIGNUP"];
  }

  else if (method == 'POST' && pathName.match(/^\/api\/login$/)) {
    return Routes["LOGIN"];
  }

  else if (method == 'PUT' && pathName.match(/^\/api\/permission$/)) {
    return Routes["UPDATE_PRIVILEGES"];
  }

  else if (method == 'POST' && pathName.match(/^\/api\/event$/)) {
    return Routes["POST_EVENT"];
  }

  else if (method == 'DELETE' && pathName.match(/^\/api\/event\/[^/]+$/)) {
    return Routes["DELETE_EVENT"];
  }

  else if (method == 'PUT' && pathName.match(/^\/api\/event\/[^/]+$/)) {
    return Routes["UPDATE_EVENT"];
  }

  else if (method == 'GET' && pathName.match(/^\/$/)) {
    return Routes["GET_HOME"];
  }

  return Routes["NOT_FOUND"];
};

export const mainRoute = (req: IncomingMessage, res: ServerResponse) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  res.write("<h1>Hello Yedidi! API:</h1>");
  res.write(`<ul>
      <li>Get a specific event by id. GET /api/event/{id}</li>
      <li>Get all events from a certain category. GET /api/event/{category}?skip={skip}&limit={limit}</li>
      <li>Get all events by a specific organizer. GET /api/event/organizer/{organizer}?skip={skip}&limit={limit}</li>
      <li>Create a new event. POST /api/event</li>
      <li>Update specific event. PUT /api/event/{id}</li>
      <li>Remove event. DELETE /api/event/{id}</li>
      <li>Signup. POST /api/signup</li>
      <li>Login. POST /api/login</li>
      <li>Update privileges. PUT /api/permission</li>
  </ul>`);
  res.end();
};

export const notFoundRoute = (req: IncomingMessage, res: ServerResponse) => {
  res.statusCode = 404;
  res.setHeader("Content-Type", "text/html");
  res.write("<h1>404 - Not Found</h1>");
  res.end();
}

export const getEventById = async (req: IncomingMessage, res: ServerResponse) => {
  // We're asserting that the caller called this function with valid URL
  const userAuth = await protectedRoute(req, res);
  if (isHTTPError(userAuth)) {
    // protectedRoute handled the response
    return;
  }

  const id = new URL(req.url, `http://${req.headers.host}`).pathname.split("/").pop();
  // If the provided ID is not a valid mongoDB identifier, it cannot be in the DB (saves a query).
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Event not found." }));
    return;
  }

  let data;
  try {
    data = await queryEventByID(id);
  }
  catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Internal Error :/" }));
    return;
  }

  if (data) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(data));
    res.end();
  } else {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Event not found." }));
  }
};

export const getEventByCategory = async (req: IncomingMessage, res: ServerResponse) => {
  // We're asserting that the caller called this function with valid URL
  const userAuth = await protectedRoute(req, res);
  if (isHTTPError(userAuth)) {
    return;
  }

  let parsedUrl: { skip: number, limit: number, pathName: string };
  // Get the query params
  parsedUrl = parseURL(req.url, `http://${req.headers.host}`);

  // try to get the event from the DB with the pagination
  const catagory = parsedUrl.pathName.split("/").pop();
  let data;
  try {
    data = await queryEventsByCategory(catagory, parsedUrl.skip, parsedUrl.limit);
  }
  catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Internal Error :/" }));
    return;
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.write(JSON.stringify(data));
  res.end();

};

export const getEventByOrganizer = async (req: IncomingMessage, res: ServerResponse) => {
  // We're asserting that the caller called this function with valid URL
  const userAuth = await protectedRoute(req, res);
  if (isHTTPError(userAuth)) {
    return;
  }

  let parsedUrl: { skip: number, limit: number, pathName: string };
  // try to get the query params
  try {
    parsedUrl = parseURL(req.url, `http://${req.headers.host}`);
  }
  catch (error) {
    res.statusCode = 400; // in workshop2 we returned 404...
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Invalid query params." }));
    return;
  }

  const organizer = parsedUrl.pathName.split("/").pop();
  let data;
  try {
    data = await queryEventsByOrganizer(organizer, parsedUrl.skip, parsedUrl.limit);
  } catch {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Internal Error :/" }));
    return;
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.write(JSON.stringify(data));
  res.end();
};

export const createEvent = async (req: IncomingMessage, res: ServerResponse) => {
  const userAuth = await protectedRoute(req, res);
  if (isHTTPError(userAuth)) {
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      const postData = JSON.parse(body);

      // TODO - check Piazza @101 if it's valid
      if (postData._id) {
        throw Error("_id is an automatically generated field.");
      }

      // Validate the event data
      const { value, error } = eventSchema.validate(postData, { abortEarly: false, allowUnknown: true, presence: 'required' });

      if (error) {
        throw Error("Bad Request.");
      }

      const insertResult = await insertEvent(value);

      if (insertResult == HTTPError["ERROR_400"]) {
        throw Error("Bad Request.")
      }

      if (insertResult == HTTPError["ERROR_500"]) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Internal Server Error" }));
        return;
      }

      res.statusCode = 201;
      res.setHeader("Content-Type", "application/json");
      res.write(JSON.stringify({ _id: insertResult }));
      res.end();
    }
    catch (error) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Bad Request." }));
      return;
    }
  });
};

export const updateEvent = async (req: IncomingMessage, res: ServerResponse) => {
  const userAuth = await protectedRoute(req, res);
  if (isHTTPError(userAuth)) {
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    const eventID = new URL(req.url, `http://${req.headers.host}`).pathname.split("/").pop();
    let event;
    let putData;

    // First, check the json is valid (throw 400 if it's not)
    // Also make sure provided fields are valid before querying the DB to check for event existance
    try {
      putData = JSON.parse(body) as Partial<ICSEvent>;

      // TODO - check Piazza @101 if it's valid
      if (putData._id) {
        throw Error("Cannot update _id field.");
      }

      const { error } = eventSchema.validate(putData, { abortEarly: false, allowUnknown: true, presence: 'optional' });

      if (error) {
        throw Error("Invalid body ;)");
      }
    }
    catch (error) {
      console.error(error);
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Bad Request." }));
      return;
    }

    // Second, check the event exists
    try {
      event = await queryEventByID(eventID);
      if (!event) {
        throw Error("Event not found.");
      }
    } catch (error) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Event not found." }));
      return;
    }

    // Third, make sure the updated event is valid
    try {

      // Patch event from putData
      const updatedEvent = await Object.assign(event, putData);

      // Validate the updated event data
      const { value, error } = eventSchema.validate(updatedEvent, { abortEarly: false, allowUnknown: true, presence: 'required' });

      if (error) {
        throw Error("Bad Request.");
      }

      updateEventByID(eventID, value);

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.write(JSON.stringify({ _id: eventID }));
      res.end();
    }

    catch (error) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Bad Request." }));
      return;
    }
  });
};

export const deleteEvent = async (req: IncomingMessage, res: ServerResponse) => {
  // We're asserting that the caller called this function with valid URL
  const userAuth = await protectedRoute(req, res);
  if (isHTTPError(userAuth)) {
    // protectedRoute handled the response
    return;
  }

  // By Piazza @61 - additional body is ignored
  const eventID = new URL(req.url, `http://${req.headers.host}`).pathname.split("/").pop();

  // If the provided ID is not a valid mongoDB identifier, it cannot be in the DB (saves a query)
  if (!mongoose.Types.ObjectId.isValid(eventID)) {
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    // if an event does not exist - Mongo will treat the deletion as a success
    deleteEventByID(eventID);
    res.statusCode = 200;
    res.end();
  }
  catch {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Internal Server Error" }));
  }
};


