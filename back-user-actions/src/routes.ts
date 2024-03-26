import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { addRefundTicketsAction, queryUserClosestEvent, queryNonRefundedPurchases, addBuyTicketsAction, isPurchaseRefunded } from './db.js';
import { hasEventStarted } from "./utils.js";
import { ACTIONS_PATH, CLOSEST_EVENT_PATH, REFUND_OPTIONS_PATH } from "./const.js";

// TODO - convert to rabbit
export const buyTickets = async (req: Request, res: Response) => {
    console.log("POST " + ACTIONS_PATH);
    try {
        const postData = req.body as { username: string, event_id: string, purchase_time: Date, ticket_name: string, ticket_amount: number, purchase_id: string };
        if (!postData.username || !postData.event_id || !postData.purchase_time || !postData.ticket_name || !postData.ticket_amount || !postData.purchase_id) {
            console.error("Missing required fields.")
            throw Error("Missing required fields.");
        }

        if (await hasEventStarted(postData.event_id)) {
            console.error("Event has already started.");
            return res.status(StatusCodes.BAD_REQUEST).send({ message: "Event has already started." });
        }

        // TODO - buy tickets with the order service

        // irl, we would've checked for failure here.
        // in practice, we don't have much to do if this fails =/
        await addBuyTicketsAction(postData);

        res.status(StatusCodes.CREATED).send({ message: "Tickets purchased." });
    }
    catch (error) {
        res.status(StatusCodes.BAD_REQUEST).send({ message: "Bad Request." });
    }
}

export const refundTickets = async (req: Request, res: Response) => {
    console.log("PUT " + ACTIONS_PATH);
    try {
        const refundDate = new Date();
        const postData = req.body as { purchase_id: string };
        if (!postData.purchase_id) {
            console.error("No purchase_id provided.")
            throw Error("No purchase_id provided.");
        }

        if (await isPurchaseRefunded(postData.purchase_id)) {
            console.error("Purchase doesn't exist or has already been refunded.")
            return res.status(StatusCodes.NOT_FOUND).send({ message: "Purchase doesn't exist or has already been refunded." });
        }

        if (await hasEventStarted(postData.purchase_id)) {
            return res.status(StatusCodes.BAD_REQUEST).send({ message: "Event has already started." });
        }



        // TODO - refund with the order service


        const insertResult = await addRefundTicketsAction(postData.purchase_id, refundDate);
        // irl, we would've checked for failure here.
        // in practice, we don't have much to do if this fails =/

        res.status(StatusCodes.OK).send({ message: "Refund success for purchase " + postData.purchase_id });
    }
    catch (error) {
        res.status(StatusCodes.BAD_REQUEST).send({ message: "Bad Request." });
    }
}

export const getClosestEvent = async (req: Request, res: Response) => {
    console.log("GET " + CLOSEST_EVENT_PATH);
    try {
        const username = req.query.username as string;
        if (!username) {
            console.error("No username provided.")
            throw Error("No username provided.");
        }

        const eventId = await queryUserClosestEvent(username);
        if (eventId === StatusCodes.NOT_FOUND) {
            return res.status(StatusCodes.NOT_FOUND).send({ message: "No events found." });
        }

        res.status(StatusCodes.OK).send({ eventId });
    }
    catch (error) {
        res.status(StatusCodes.BAD_REQUEST).send({ message: "Bad Request." });
    }
}

export const getNonRefundedPurchases = async (req: Request, res: Response) => {
    console.log("GET " + REFUND_OPTIONS_PATH);
    try {
        const username = req.query.username as string;
        if (!username) {
            console.error("No username provided.")
            throw Error("No username provided.");
        }

        const purchases = await queryNonRefundedPurchases(username);

        if (purchases === StatusCodes.INTERNAL_SERVER_ERROR) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error." });
        }

        if ((Array.isArray(purchases) && purchases.length === 0)) {
            return res.status(StatusCodes.NOT_FOUND).send({ message: "No purchases found." });
        }

        res.status(StatusCodes.OK).send({ purchases });
    }
    catch (error) {
        res.status(StatusCodes.BAD_REQUEST).send({ message: "Bad Request." });
    }
}