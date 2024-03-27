import axios from "axios";
import UserAction, { IUserAction } from "./models/UserAction.js";
import { StatusCodes } from 'http-status-codes';
import { EVENT_API_URL } from "./const.js";

export const addBuyTicketsAction = async (purchaseDetails: IUserAction): Promise<number> => {
    let newUserAction;
    try {
        newUserAction = new UserAction(purchaseDetails);
        await newUserAction.validate();
    }
    catch (err) {
        return StatusCodes.BAD_REQUEST;
    }

    try {
        await newUserAction.save();
        return StatusCodes.CREATED;
    }
    catch (err) {
        return StatusCodes.INTERNAL_SERVER_ERROR;
    }
}

export const addRefundTicketsAction = async (purchaseId: string, refundDate: Date): Promise<number> => {
    try {
        const userAction = await UserAction.findOne({ purchase_id: purchaseId });
        if (!userAction) {
            return StatusCodes.NOT_FOUND;
        }
        userAction.refund_time = refundDate;
        userAction.save();
        return StatusCodes.OK;
    }

    catch (err) {
        console.error("Error refunding purchase " + purchaseId);
        return StatusCodes.INTERNAL_SERVER_ERROR;
    }
}

export const queryUserClosestEvent = async (username: string): Promise<{ eventTitle: string, eventStartDate: Date } | number> => {
    try {
        const userActions = (await UserAction.find({ username: username, refund_time: { $exists: false } })).map((userAction) => userAction.event_id);
        if (userActions.length === 0) {
            return StatusCodes.NOT_FOUND;
        }
        const axiosInstance = axios.create({ withCredentials: true, baseURL: EVENT_API_URL });
        const result = await axiosInstance.get("/api/closest_event?event_ids=" + userActions.join(","));
        return result.data as { eventTitle: string, eventStartDate: Date };
    }
    catch (error) {
        console.error("Error getting closest event for user " + username);
        return StatusCodes.INTERNAL_SERVER_ERROR;
    }
}

export const queryNonRefundedPurchases = async (username: string): Promise<IUserAction[] | number> => {
    try {
        return await UserAction.find({ username: username, refund_time: { $exists: false } });
    }
    catch (error) {
        console.error("Error getting non-refunded purchases for user " + username);
        return StatusCodes.INTERNAL_SERVER_ERROR;
    }
}

// TODO - remove?
export const isPurchaseRefunded = async (purchaseId: string): Promise<boolean> => {
    try {
        const userAction = await UserAction.findOne({ purchase_id: purchaseId });
        return userAction && userAction.refund_time !== undefined;
    }
    catch (error) {
        console.error("Error checking if purchase " + purchaseId + " is refunded.");
        return false;
    }
}

export const queryActionByPurchaseId = async (purchaseId: string): Promise<IUserAction | null> => {
    try {
        const userAction = await UserAction.findOne({ purchase_id: purchaseId });
        return userAction.toJSON() as IUserAction;
    }
    catch (error) {
        console.error("Error getting purchase " + purchaseId);
        return null;
    }
}