import mongoose from "mongoose";
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { insertTicket, insertTickets, queryAllTicketsByEventID, queryAvailableTicketsByEventID, queryCheapestTicketsByEventID, queryTicketByName, updateTicketAmount } from "./db.js";
import { ICSTicket, ticketSchema } from "./models/CSTicket.js";
import { MAX_TICKET_LIMIT, ORDER_API_URL } from "./const.js";
import { PublisherChannel } from "./publisher-channel.js";
import axios from 'axios';
import { PaymentInformation, paymentInformationSchema } from "./types.js";

const axiosInstance = axios.create({ withCredentials: true, baseURL: ORDER_API_URL });


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
    console.log("POST /api/ticket");
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

export const createTickets = async (req: Request, res: Response) => {
    console.log("POST /api/tickets");
    try {
        const postData = req.body as ICSTicket[];
        if (postData.length === 0) {
            console.error("No tickets provided.")
            throw Error("No tickets provided.");
        }

        postData.map(ticket => ticket.available = ticket.total); // Added
        // Validate the ticket data
        const validationResults = postData.map(ticket => ticketSchema.validate(ticket, { abortEarly: false, allowUnknown: true, presence: 'required' }));
        const errors = validationResults.filter(result => result.error);
        if (errors.length > 0) {
            console.error("Ticket schema validation failed");
            throw Error("Bad Request.");
        }
        const insertResult = await insertTickets(postData);

        if (insertResult == StatusCodes.BAD_REQUEST) {
            console.error("Failed inserting tickets to DB");
            throw Error("Bad Request.")
        }

        if (insertResult == StatusCodes.INTERNAL_SERVER_ERROR) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal server error");
            return;
        }

        res.status(StatusCodes.CREATED).send({ "message": "Tickets created." });
    }
    catch (error) {
        res.status(StatusCodes.BAD_REQUEST).send({ message: "Bad Request." });
    }
}

// TODO - check updateEvent in back-events/src/routes.ts and replicate logic!
export const purchaseTicket = async (req: Request, res: Response) => {
    console.log("PUT /api/ticket");
    let postData;
    let ticket;
    const publisherChannel: PublisherChannel = req.publisherChannel;
    try {
        postData = req.body as PaymentInformation;
        const { error } = paymentInformationSchema.validate(postData);
        if (error) {
            console.log(error);
            res.status(StatusCodes.BAD_REQUEST).send({ message: "Bad Request." });
            return;
        }
        // Get the wanted ticket
        ticket = await queryTicketByName(postData.event_id, postData.ticket_name);
        if (!ticket) {
            console.error("Ticket not found");
            console.error(ticket);
            throw Error("Ticket not found.");
        }
        // TODO - Make sure we have enough tickets to sell or that they are reseved in the locked array for the user!
        if (ticket.available < postData.ticket_amount) {
            console.error("Not enough tickets available.");
            throw Error("Not enough tickets available.");
        }

        console.log(`>> Buying ${postData.ticket_amount} tickets for of id ${ticket._id}`);
        const result = await updateTicketAmount(ticket._id.toString(), -postData.ticket_amount);

        if (result != StatusCodes.OK) {
            console.error("Failed updating ticket in DB");
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal server error");
            return;
        }
    }
    catch (error) {
        console.error("Encountered error while purchasing ticket: ", error);
        res.status(StatusCodes.BAD_REQUEST).send({ message: "Bad Request." });
        return;
    }

    try {
        // CREATE THE ORDER, AND UNDO CHANGES IF FAILED
        const orderResult = await axiosInstance.post("/api/buy", postData);
        if (orderResult.status != StatusCodes.OK) {
            console.error("I believe this code is unreachable. Can you see me?");
            throw Error("Failed buying ticket!");
        }

        if (ticket.available === postData.ticket_amount) { // If we sold all tickets, send new cheapest ticket
            const newCheapestTicket = await queryCheapestTicketsByEventID(postData.event_id); // could be null
            await publisherChannel.sendEvent(JSON.stringify(newCheapestTicket));
        }

        res.status(StatusCodes.OK).send({ order_id: orderResult.data.order_id });
    }
    catch (error) {
        // UNDO CHANGES
        // console.error(error);
        // TODO - when hammerhead returns 500 we don't handel it properly - can't try to purchase again...
        console.error("Failed buying ticket - Order API failed");
        await updateTicketAmount(ticket._id.toString(), postData.ticket_amount);
        console.error("Ticket purchase failed. Rolling back changes.");
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
        return;
    }

}
