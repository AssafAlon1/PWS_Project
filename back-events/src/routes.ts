import mongoose from "mongoose";
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { deleteEventByID, insertEvent, queryClosestEvent, queryEventByID, queryUpcomingAvailableEvents, queryUpcomingEvents, updateEventByID } from "./db.js";
import { ICSEvent, JoiEventCreationRequestSchema, eventSchema, updateEventSchema } from "./models/CSEvent.js";
import { MAX_QUERY_LIMIT, TICKET_API_URL } from "./const.js";
import { CSEventWithTickets } from "./types.js";
import axios from "axios";
import Joi from 'joi';

const axiosInstance = axios.create({ withCredentials: true, baseURL: TICKET_API_URL });

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
  console.log("GET /api/event/:eventId OR /api/event/backoffice/:eventId");
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

  if (!req.keepSensitiveInfo && data.comment_count) {
    delete data.comment_count;
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
    await axiosInstance.post('/api/tickets', postData.tickets.map(ticket => ({ ...ticket, eventId: insertResult })));
    res.status(StatusCodes.CREATED).send({ _id: insertResult });
  }
  catch (error) {
    console.error("Error inserting tickets for event: ", insertResult + ". Deleting event...");
    deleteEventByID(insertResult); // Cleanup event if ticket insertion fails
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal server error");
    console.error(error);
    return;
  }
};


export const updateEvent = async (req: Request, res: Response) => {
  console.log("PUT /api/event/:eventId/postpone");
  const eventId = req.params.eventId;
  let event: ICSEvent | null;
  let putData;

  putData = req.body as Partial<ICSEvent>;
  const { error } = await updateEventSchema.validate(putData); // make sure only start and end times are updated
  if(error){
    res.status(StatusCodes.BAD_REQUEST).send({ message: "Cannot update this!" });
    return;
  }
  
  // Check the event exists
  try {
    event = await queryEventByID(eventId);
    if (!event) {
      throw Error("Event not found.");
    }
  } catch (error) {
    console.error("Event not found.");
    res.status(StatusCodes.NOT_FOUND).send({ message: "Event not found." });
    return;
  }

  if( new Date(putData.start_date) < new Date(event.start_date) ){
    res.status(StatusCodes.BAD_REQUEST).send({ message: "Cannot update event to start earlier!" });
    return;
  }

  // Make sure the updated event is valid
  try {
    // Patch event from putData
    const updatedEvent = await Object.assign(event, putData);

    // Validate the updated event data
    const { value, error } = eventSchema.validate(updatedEvent, { abortEarly: false, allowUnknown: true, presence: 'required' });

    if (error) {
      throw Error("Bad Request.");
    }

    updateEventByID(eventId, value);
    res.status(StatusCodes.OK).send({ _id: eventId });
  }

  catch (error) {
    console.error("Error updating event: ", error);
    res.status(StatusCodes.BAD_REQUEST).send({ message: "Bad Request." });
    return;
  }
};


export const getClosestEvent = async (req: Request, res: Response) => {
  console.log("GET /api/closest_event");
  const eventIDs = req.query.event_ids as string;
  if (!eventIDs) {
    console.error("No event_ids provided.")
    res.status(StatusCodes.BAD_REQUEST).send({ message: "Bad Request." });
    return;
  }

  const eventIDArray = eventIDs.split(",");

  let closestEvent;
  try {
    closestEvent = await queryClosestEvent(eventIDArray);
    if (!closestEvent) {
      res.status(StatusCodes.NOT_FOUND).send({ message: "No events found." });
      return;
    }
  }
  catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
    return;
  }
  res.status(StatusCodes.OK).send({ eventTitle: closestEvent.title, eventStartDate: closestEvent.start_date });
}

