import { IncomingMessage, ServerResponse } from "http";
import { HTTPError, Routes } from "./types.js";
import { deleteEventByID, insertEvent, queryEventByID, updateEventByID } from "./db.js";
import { ICSEvent, eventSchema } from "./models/CSEvent.js";
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

  else if (method == 'POST' && pathName.match(/^\/api\/event$/)) {
    return Routes["POST_EVENT"];
  }

  else if (method == 'DELETE' && pathName.match(/^\/api\/event\/[^/]+$/)) {
    return Routes["DELETE_EVENT"];
  }

  else if (method == 'PUT' && pathName.match(/^\/api\/event\/[^/]+$/)) {
    return Routes["UPDATE_EVENT"];
  }

  return Routes["NOT_FOUND"];
};

export const notFoundRoute = (req: IncomingMessage, res: ServerResponse) => {
  res.statusCode = 404;
  res.setHeader("Content-Type", "text/html");
  res.write("<h1>404 - Not Found</h1>");
  res.end();
}

export const getEventById = async (req: IncomingMessage, res: ServerResponse) => {
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


export const createEvent = async (req: IncomingMessage, res: ServerResponse) => {

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
  // TODO - UPDATE THIS FOR PROJECT REQUIREMENTS (what can be updated? what can't?)
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


