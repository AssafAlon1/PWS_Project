import { Request, Response } from 'express';
import { deleteEventByID, insertEvent, queryEventByID, queryUpcomingEvents, updateEventByID } from "./db.js";
import { ICSEvent, eventSchema } from "./models/CSEvent.js";
import mongoose from "mongoose";
import { StatusCodes } from 'http-status-codes';

export const getUpcomingEvents = async (req: Request, res: Response) => {
  console.log("GET /api/event");
  const skip = parseInt(req.query.skip as string) || 0;
  const limit = parseInt(req.query.limit as string) || 50;
  let data;
  try {
    data = await queryUpcomingEvents(skip, limit);
  }
  catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
    return;
  }
  
  res.status(StatusCodes.OK).send(data);
}

export const getEventById = async (req: Request, res: Response) => {
  const id = req.params.eventId;
  // If the provided ID is not a valid mongoDB identifier, it cannot be in the DB (saves a query).
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(StatusCodes.NOT_FOUND).send({ message: "Event not found." });
    return;
  }

  let data;
  try {
    data = await queryEventByID(id);
  }
  catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
    return;
  }

  if (data) {
    res.status(StatusCodes.OK).send(data);
  } else {
    res.status(StatusCodes.NOT_FOUND).send({ message: "Event not found." });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const postData = req.body as ICSEvent;

    if (postData._id) {
      throw Error("_id is an automatically generated field.");
    }

    // Validate the event data
    const { value, error } = eventSchema.validate(postData, { abortEarly: false, allowUnknown: true, presence: 'required' });

    if (error) {
      throw Error("Bad Request.");
    }

    const insertResult = await insertEvent(value);

    if (insertResult == StatusCodes.BAD_REQUEST) {
      throw Error("Bad Request.")
    }

    if (insertResult == StatusCodes.INTERNAL_SERVER_ERROR) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal server error");
      return;
    }

    res.status(StatusCodes.CREATED).send({ _id: insertResult });
  }
  catch (error) {
    res.status(StatusCodes.BAD_REQUEST).send("Bad Request");
    return;
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  // TODO - UPDATE THIS FOR PROJECT REQUIREMENTS (what can be updated? what can't?)

  const eventID = new URL(req.url, `http://${req.headers.host}`).pathname.split("/").pop();
  let event;
  let putData;

  // First, check the json is valid (throw 400 if it's not)
  // Also make sure provided fields are valid before querying the DB to check for event existance
  try {
    putData = JSON.parse(req.body) as Partial<ICSEvent>;

    if (putData._id) {
      throw Error("Cannot update _id field.");
    }

    const { error } = eventSchema.validate(putData, { abortEarly: false, allowUnknown: true, presence: 'optional' });

    if (error) {
      throw Error("Invalid body ;)");
    }
  }
  catch (error) {
    res.status(StatusCodes.BAD_REQUEST).send({ message: "Bad Request." });
    console.error(error);
    return;
  }

  // Second, check the event exists
  try {
    event = await queryEventByID(eventID);
    if (!event) {
      throw Error("Event not found.");
    }
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).send({ message: "Event not found." });
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
    res.status(StatusCodes.OK).send({ _id: eventID });
  }

  catch (error) {
    res.status(StatusCodes.BAD_REQUEST).send({ message: "Bad Request." });
    return;
  }
};

// export const deleteEvent = async (req: Request, res: Response) => {

//   const eventID = new URL(req.url, `http://${req.headers.host}`).pathname.split("/").pop();

//   // If the provided ID is not a valid mongoDB identifier, it cannot be in the DB (saves a query)
//   if (!mongoose.Types.ObjectId.isValid(eventID)) {
//     res.status(StatusCodes.OK).send();
//     return;
//   }

//   try {
//     // if an event does not exist - Mongo will treat the deletion as a success
//     deleteEventByID(eventID);
//     res.send();
//   }
//   catch {
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
//   }
// };
