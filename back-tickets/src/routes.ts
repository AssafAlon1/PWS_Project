import mongoose from "mongoose";
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { insertTicket, queryAllTicketsByEventID, queryAvailableTicketsByEventID } from "./db.js";
import { ICSTicket, ticketSchema } from "./models/CSTicket.js";
import { MAX_TICKET_LIMIT } from "./const.js";

export const getALLTicketsByEventId = async (req: Request, res: Response) => {
    console.log("GET /api/ticket/all");
    const eventId = req.params.eventId;
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || MAX_TICKET_LIMIT; 
    let data;
    try {
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