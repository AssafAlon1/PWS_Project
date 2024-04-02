import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { addRefundTicketsAction, queryUserClosestEvent, addBuyTicketsAction, queryActionByPurchaseId, queryAllUserActions } from './db.js';
import { hasEventStarted } from "./utils.js";
import { ACTIONS_PATH, CLOSEST_EVENT_PATH, MAX_QUERY_LIMIT, ORDER_API_URL } from "./const.js";
import axios from 'axios';

const axiosInstance = axios.create({ withCredentials: true, baseURL: ORDER_API_URL });


// TODO - verify (not necessarily here, but not in the front end)
//        that the user that bought the tickets is the one asking to refund them
export const refundTickets = async (req: Request, res: Response) => {
    console.log("PUT " + ACTIONS_PATH);
    try {
        const refundDate = new Date();
        const postData = req.body as { purchase_id: string };
        if (!postData.purchase_id) {
            console.error("No purchase_id provided.")
            res.status(StatusCodes.BAD_REQUEST).send({ message: "Bad Request." });
            return;
        }

        const refund_details = await queryActionByPurchaseId(postData.purchase_id);
        if (refund_details === null) {
            return res.status(StatusCodes.NOT_FOUND).send({ message: "Error getting the action details" });
        }
        if (refund_details.refund_time !== undefined) {
            console.error("Purchase doesn't exist or has already been refunded.")
            return res.status(StatusCodes.NOT_FOUND).send({ message: "Purchase doesn't exist or has already been refunded." });
        }

        if (await hasEventStarted(postData.purchase_id)) {
            return res.status(StatusCodes.BAD_REQUEST).send({ message: "Event has already started." });
        }

        const refundInformation = {
            purchase_id: postData.purchase_id,
            event_id: refund_details.event_id,
            ticket_name: refund_details.ticket_name,
            ticket_amount: refund_details.ticket_amount,
        };
        // TODO - refund with the order service
        const refundResult = await axiosInstance.post('/api/refund', refundInformation);
        if (refundResult.status !== StatusCodes.OK) {
            throw Error("Failed to refund tickets.");
        }

        const insertResult = await addRefundTicketsAction(postData.purchase_id, refundDate);
        // irl, we would've checked for failure here.
        // in practice, we don't have much to do if this fails =/

        res.status(StatusCodes.OK).send({ message: "Refund success for purchase " + postData.purchase_id });
    }
    catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Failed to refund tickets." });
        console.error("Failed to refund tickets.");
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

        const closestEvent = await queryUserClosestEvent(username);
        if (closestEvent === StatusCodes.NOT_FOUND) {
            return res.status(StatusCodes.NOT_FOUND).send({ message: "No events found." });
        }

        // console.log(" >> Closest event: ", closestEvent);
        res.status(StatusCodes.OK).send(closestEvent);
    }
    catch (error) {
        res.status(StatusCodes.BAD_REQUEST).send({ message: "Bad Request." });
    }
}

export const getUserActions = async (req: Request, res: Response) => {
    console.log("GET " + ACTIONS_PATH);
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || MAX_QUERY_LIMIT;
    try {
        const username = req.query.username as string;
        if (!username) {
            console.error("No username provided.")
            throw Error("No username provided.");
        }

        const actions = await queryAllUserActions(username, skip, limit);

        res.status(StatusCodes.OK).send(actions);
    }
    catch (error) {
        res.status(StatusCodes.BAD_REQUEST).send({ message: "Bad Request." });
    }
}

// TODO - Only for the user that bought the tickets?
export const getUserActionByPurchaseId = async (req: Request, res: Response) => {
    console.log("GET " + `${ACTIONS_PATH}/:purchase_id`);
    try {
        // const username = req.query.username as string;
        const purchase_id = req.params.purchase_id;
        if (!purchase_id) {
            console.error("Invalid parameters.")
            throw Error("Invalid parameters.");
        }

        const action = await queryActionByPurchaseId(purchase_id);
        if (action === null) {
            return res.status(StatusCodes.NOT_FOUND).send({ message: "Action not found." });
        }
        console.log("Returning action ");
        console.log(action);
        res.status(StatusCodes.OK).send(action);
    }
    catch (error) {
        console.error("Invalid parameters");
        res.status(StatusCodes.BAD_REQUEST).send({ message: "Bad Request." });
    }
}

