import { ICSTicket, lockSchema, ticketSchema } from "./models/CSTicket.js";
import { isSoldOut, queryCheapestTicketsByEventID, removeTicketLock, addTicketLock } from "./db.js"
import { LOCK_GRACE_PERIOD_SECONDS, ORDER_API_URL } from "./const.js";
import { PaymentInformation } from "./types.js";
import { PublisherChannel } from "./publisher-channel.js";

import { StatusCodes } from "http-status-codes";
import axios from "axios";

const axiosInstance = axios.create({ withCredentials: true, baseURL: ORDER_API_URL });

export const purchaseTicketFromLock = async (ticket: ICSTicket, paymentInformation: PaymentInformation, publisherChannel: PublisherChannel) => {
    let orderResult;
    if (!ticket._id) {
        throw new Error("Ticket does not have an _id");
    }

    // Get the (minimum) lock for the user
    const lock = ticket.locked.reduce((minLock, currentLock) => {
        if (
            currentLock.username === paymentInformation.username &&
            currentLock.quantity === paymentInformation.ticket_amount &&
            currentLock.expires > new Date(new Date().getTime() - LOCK_GRACE_PERIOD_SECONDS * 1000) &&
            (!minLock || currentLock.expires < minLock.expires)
        ) {
            return currentLock;
        }
        return minLock;
    }, null);

    if (!lock) {
        console.error("NO LOCK FOUND!");
        throw new Error("No lock found");
    }

    // Remove the tickets from the locked array (to avoid case where the lock-cleanup removes this lock mid-purchase)
    const result = await removeTicketLock(ticket._id.toString(), lock.username, lock.quantity, lock.expires);
    if (!result) {
        throw new Error("Failed to remove lock");
    }

    // call shark to purchase the tickets
    try {
        // CREATE THE ORDER, AND UNDO CHANGES IF FAILED
        orderResult = await axiosInstance.post("/api/buy", paymentInformation);
        if (orderResult.status != StatusCodes.OK) {
            console.error("I believe this code is unreachable. Can you see me?");
            throw Error("Failed buying ticket!");
        }
    }

    // if failed, re-add the tickets to the locked array
    catch (error) {
        console.error("Failed buying ticket - Order API failed");
        // if this fails the db is inconsistant! - the tickets are "lost"
        addTicketLock(ticket._id.toString(), lock.username, lock.quantity, lock.expires); // Theoretically, we'd like to retry this in the case of failure
        throw new Error("Failed buying ticket");
    }

    // If we sold all tickets, send new cheapest ticket
    try {
        if (await isSoldOut(ticket._id.toString())) {
            const newCheapestTicket = await queryCheapestTicketsByEventID(paymentInformation.event_id);
            const newCheapestMessage = {
                eventId: paymentInformation.event_id,
                name: newCheapestTicket.name ?? "No tickets available",
                price: newCheapestTicket?.price ?? 0
            }
            await publisherChannel.sendEvent(JSON.stringify(newCheapestMessage));
        }
    }
    catch (error) {
        // Theoretically, we'd like to retry the `try` block a few times to remain consistent with the DB
        console.error("Failed to send new cheapest ticket");
    }

    return orderResult.data.order_id;
}


