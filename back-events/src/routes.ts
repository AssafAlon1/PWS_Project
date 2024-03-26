import mongoose from "mongoose";
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { deleteEventByID, insertEvent, queryEventByID, queryUpcomingAvailableEvents, queryUpcomingEvents, updateEventByID } from "./db.js";
import { ICSEvent, JoiEventCreationRequestSchema, eventSchema } from "./models/CSEvent.js";
import { MAX_QUERY_LIMIT, TICKET_SERVICE_URL } from "./const.js";
import { CSEventWithTickets } from "./types.js";
import axios from "axios";

const axiosInstance = axios.create({ withCredentials: true, baseURL: TICKET_SERVICE_URL });

export const getUpcomingEvents = async (req: Request, res: Response) => {
  console.log("GET /api/event");
  const skip = parseInt(req.query.skip as string) || 0;
  const limit = parseInt(req.query.limit as string) || MAX_QUERY_LIMIT;
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

export const getUpcomingAvailableEvents = async (req: Request, res: Response) => {
  console.log("GET /api/event");
  const skip = parseInt(req.query.skip as string) || 0;
  const limit = parseInt(req.query.limit as string) || MAX_QUERY_LIMIT;
  let data;
  try {
    data = await queryUpcomingAvailableEvents(skip, limit);
  }
  catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
    return;
  }

  res.status(StatusCodes.OK).send(data);
}

export const getEventById = async (req: Request, res: Response) => {
  console.log("GET /api/event/:eventId")
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
  console.log("POST /api/event");
  let insertResult;
  let postData: CSEventWithTickets;
  try {
    postData = req.body;

    if (postData._id) {
      throw Error("_id is an automatically generated field.");
    }

    // Validate the event data
    const { value, error } = JoiEventCreationRequestSchema.validate(postData, { abortEarly: false, allowUnknown: true, presence: 'required' });

    if (error) {
      console.error("Error validating event creation request: ", error);
      throw Error("Bad Request.");
    }

    // Validate all pre-processing was successful
    value.total_available_tickets = value.tickets.reduce((acc, ticket) => acc + ticket.total, 0);
    value.cheapest_ticket_price = Math.min(...value.tickets.map(ticket => ticket.price));
    value.cheapest_ticket_name = value.tickets.find(ticket => ticket.price === value.cheapest_ticket_price)?.name;
    value.comment_count = 0;
    const { value: validatedEvent, error: errorEvent } = eventSchema.validate(value, { abortEarly: false, allowUnknown: true, presence: 'required' });

    if (errorEvent) {
      console.error("Error validating event creation request: ", errorEvent);
      throw Error("Bad Request.");
    }

    insertResult = await insertEvent(validatedEvent);

    if (insertResult == StatusCodes.BAD_REQUEST) {
      throw Error("Bad Request.")
    }

    if (insertResult == StatusCodes.INTERNAL_SERVER_ERROR) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal server error");
      return;
    }
  }
  catch (error) {
    res.status(StatusCodes.BAD_REQUEST).send("Bad Request");
    return;
  }

  // Insertion was successful - add the tickets
  try {
    console.log("Initialized axios instance with Tickets URL: ", TICKET_SERVICE_URL);
    await axiosInstance.post('/api/tickets', postData.tickets.map(ticket => ({ ...ticket, eventId: insertResult })));
    res.status(StatusCodes.CREATED).send({ _id: insertResult });
  }
  catch (error) {
    console.error("Error inserting tickets for event: ", insertResult + ". Deleting event...");
    console.error(error.response.data);
    deleteEventByID(insertResult); // Cleanup event if ticket insertion fails
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal server error");
    return;
  }
};

// TODO - Legacy, may remove
export const createTicketlessEvent = async (req: Request, res: Response) => {
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
  // TODO - UPDATE THIS FOR PROJECT REQUIREMENTS - only allow start date to be postponed

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
