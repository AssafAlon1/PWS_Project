import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { insertTickets, lockTickets, queryAllTicketsByEventID, queryTicketByName } from "./db.js";
import { ICSTicket, lockRequestSchema, ticketSchema } from "./models/CSTicket.js";
import { MAX_TICKET_LIMIT } from "./const.js";
import { PublisherChannel } from "./publisher-channel.js";
import { LockInformation, PaymentInformation, paymentInformationSchema } from "./types.js";
import { purchaseTicketFromLock } from './utilities.js';

interface ICSTicketFlexible extends ICSTicket {
    locked_amount?: number;
}

export const getALLTicketsByEventId = async (req: Request, res: Response) => {
    console.log("GET /api/ticket/all");
    const eventId = req.params.eventId;
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || MAX_TICKET_LIMIT;
    let data: ICSTicketFlexible[];
    try {
        console.log("Gonna fetch tickets for eventId: ", eventId);
        data = await queryAllTicketsByEventID(eventId, skip, limit);
    }
    catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
        return;
    }

    if (!req.keepSensitiveInfo) {
        data.forEach(ticket => {
            delete ticket.total;
            ticket.locked_amount = ticket.locked.reduce((acc, lock) => {
                return acc + lock.quantity;
            }, 0);
        });
    }
    data.forEach(ticket => {delete ticket.locked});

    res.status(StatusCodes.OK).send(data);
}

export const createTickets = async (req: Request, res: Response) => {
    console.log("POST /api/tickets");
    try {
        const postData = req.body as ICSTicket[];
        if (postData.length === 0) {
            console.error("No tickets provided.")
            throw Error("No tickets provided.");
        }
        postData.map(ticket => {
            ticket.available = ticket.total;
            // ticket.locked = [];
        });
        // Validate the ticket data
        const validationResults = postData.map(ticket => ticketSchema.validate(ticket, { abortEarly: false, allowUnknown: true }));
        const errors = validationResults.filter(result => result.error);
        if (errors.length > 0) {
            console.error("Ticket schema validation failed");
            console.log(errors);
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

export const purchaseTicket = async (req: Request, res: Response) => {
    console.log("PUT /api/ticket");
    let postData;
    let ticket: ICSTicket;
    const publisherChannel: PublisherChannel = req.publisherChannel;

    postData = req.body as PaymentInformation;
    const { error } = paymentInformationSchema.validate(postData);
    if (error) {
        console.log("Payment Information invalid", error);
        res.status(StatusCodes.BAD_REQUEST).send({ message: "Payment Information invalid." });
        return;
    }
    // Get the wanted ticket
    ticket = await queryTicketByName(postData.event_id, postData.ticket_name);
    if (!ticket) {
        console.error("Ticket not found");
        res.status(StatusCodes.BAD_REQUEST).send({ message: "Ticket not found." });
        return;
    }

    // Check if the user has a lock on the tickets
    const doesUserHaveLock: boolean = ticket.locked.find(lock =>
        lock.username === postData.username &&
        lock.quantity === postData.ticket_amount &&
        lock.expires  > new Date()
    ) !== null;
    console.log("[DEBUG] doesUserHaveLock: ", doesUserHaveLock);

    // purchase the tickets from the available tickets:
    // if there are enough tickets available, lock them and purchase from the lock.
    if(!doesUserHaveLock) {
        console.log("User doesn't have a lock on the tickets - attempting lock");
        if (ticket.available < postData.ticket_amount) {
            console.error("Not enough tickets available.");
            res.status(StatusCodes.BAD_REQUEST).send({ message: "Not enough tickets available." });
            return;
        }

        // Lock the tickets
        const lockResult = await lockTickets(postData.event_id, postData.ticket_name, postData.ticket_amount, postData.username);
        if (lockResult != StatusCodes.OK) {
            console.error("Failed to lock tickets to purchase :(");
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Failed to lock tickets to purchase" });
            return;
        }
    }
  
    // Assuming the user has a lock on the tickets, purchase the tickets from the lock
    try {
        console.log("gonna buy ticket from lock");
        const purchaseInfo = await purchaseTicketFromLock(ticket, postData, publisherChannel);
        res.status(StatusCodes.OK).send({ order_id: purchaseInfo });
        return;
    }
    catch(error) {
        console.error("Failed purchasing ticket from lock: ", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Failed purchasing ticket" });
        return;
    }      
}

export const lockTicket = async (req: Request, res: Response) => {
    console.log("PUT /api/ticket/lock");
    let postData: LockInformation;
    try {
        postData = req.body;
        const { error } = lockRequestSchema.validate(postData);
        if (error) {
            console.log("Bad request", error);
            res.status(StatusCodes.BAD_REQUEST).send({ message: "Bad Request." });
            return;
        }

        console.log(`>> Locking ${postData.quantity} tickets of type ${postData.ticketName} for event id ${postData.eventId}`);
        const result = await lockTickets(postData.eventId, postData.ticketName, postData.quantity, postData.username);

        if (result != StatusCodes.OK) {
            console.error("Failed updating ticket in DB");
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal server error");
            return;
        }
    }
    catch (error) {
        console.error("Encountered error while locking ticket: ", error);
        res.status(StatusCodes.BAD_REQUEST).send({ message: "Bad Request." });
        return;
    }

    res.status(StatusCodes.OK).send({ message: "Ticket locked." });
}
