import mongoose from "mongoose";
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { insertTicket, queryAllTicketsByEventID, queryAvailableTicketsByEventID, queryCheapestTicketsByEventID, queryTicketByName, updateTicket } from "./db.js";
import { ICSTicket, ticketSchema } from "./models/CSTicket.js";
import { MAX_TICKET_LIMIT } from "./const.js";
import { PublisherChannel } from "./publisher-channel.js";

export const getALLTicketsByEventId = async (req: Request, res: Response) => {
    console.log("GET /api/ticket/all");
    const eventId = req.params.eventId;
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || MAX_TICKET_LIMIT; 
    let data;
    try {
        console.log("Gonna fetch tickets for eventId: ", eventId);
        data = await queryAllTicketsByEventID(eventId, skip, limit);
    }
    catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
        return;
    }

    res.status(StatusCodes.OK).send(data);
}

export const getAvailableTicketsByEventId = async (req: Request, res: Response) => {
    console.log("GET /api/ticket");
    const eventId = req.params.eventId;
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || MAX_TICKET_LIMIT; 
    let data;
    try {
        data = await queryAvailableTicketsByEventID(eventId, skip, limit);
    }
    catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
        return;
    }

    res.status(StatusCodes.OK).send(data);
}

export const createTicket = async (req: Request, res: Response) => {
    try {
        const postData = req.body as ICSTicket;
        postData.available = postData.total; // Added

        if (postData._id) {
            throw Error("_id is an automatically generated field.");
        }

        // Validate the ticket data
        const { value, error } = ticketSchema.validate(postData, { abortEarly: false, allowUnknown: true, presence: 'required' });

        if (error) {
            throw Error("Bad Request.");
        }

        const insertResult = await insertTicket(postData);

        if (insertResult == StatusCodes.BAD_REQUEST) {
            throw Error("Bad Request.")
        }
      
        if (insertResult == StatusCodes.INTERNAL_SERVER_ERROR) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal server error");
        return;
        }

        res.status(StatusCodes.CREATED).send({ ticket_id: insertResult });
    }
    catch (error) {
        res.status(StatusCodes.BAD_REQUEST).send({ message: "Bad Request." });
    }
}

// TODO - check updateEvent in back-events/src/routes.ts and replicate logic!
export const purchaseTicket = async (req: Request, res: Response) => {
    console.log("PUT /api/ticket");
    try {
        const putData = req.body as { eventId: string, ticketName: string, amount: number };
        const publisherChannel: PublisherChannel = req.publisherChannel;
        // Get the wanted ticket
        const ticket = await queryTicketByName(putData.eventId, putData.ticketName);
        if (!ticket) { // Shouldn't get here
            throw Error("Ticket not found.");
        }
        // TODO - Make sure we have enough tickets to sell or that they are reseved in the locked array for the user!
        if (ticket.available < putData.amount) { 
            throw Error("Not enough tickets available.");
        }

        // Create updated ticket
        const updatedTicket = {
            _id: ticket._id,
            eventId: putData.eventId,
            name: putData.ticketName,
            available: ticket.available - putData.amount,
            total: ticket.total,
            price: ticket.price
        };

        // Validate the ticket data
        const { value, error } = ticketSchema.validate(updatedTicket, { abortEarly: false, allowUnknown: true, presence: 'required' });
        if (error) {
            console.error("Ticket schema validation failed");
            throw Error("Bad Request.");
        }

        const insertResult = await updateTicket(updatedTicket);
        console.log("insertResult: ", insertResult);

        if (insertResult == StatusCodes.BAD_REQUEST) {
            console.error("Failed updating ticket in DB");
            throw Error("Bad Request.")
        }

        if (insertResult == StatusCodes.INTERNAL_SERVER_ERROR) {
            console.error("Failed inserting comment to DB");
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal server error");
            return;
        }

        if(ticket.available === putData.amount) { // If we sold all tickets, send new cheapest ticket
            const newCheapestTicket = await queryCheapestTicketsByEventID(putData.eventId); // could be null
            await publisherChannel.sendEvent(JSON.stringify(newCheapestTicket));
        }
        res.status(StatusCodes.OK);
    } 
    catch (error) {
        console.error("Encountered error while purchasing ticket: ", error);
        res.status(StatusCodes.BAD_REQUEST).send({ message: "Bad Request." });
        return;
    }

    res.status(StatusCodes.OK).send({ message: "Ticket purchased" });
}