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
            currentLock.expires > new Date(new Date().getTime() - LOCK_GRACE_PERIOD_SECONDS * 1000) && // TODO - Make sure when cleaning up old tickets, give 2 * LOCK_GRACE_PERIOD_SECONDS
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
        console.log(`>> Buying ${paymentInformation.ticket_amount} tickets for of id ${ticket._id}`);
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
        if (isSoldOut(ticket._id.toString())) {
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

// TODO - In frontend, show amount of locked tickets ("xx tickets are about to be purchased...)
// TODO - In frontend checkout page, indicate user if there's no available tickets to buy (maybe by kicking them out to the catalog or something)

// TODO - change lock+unlock mechanism with timeout!
/*
async function lockTickets(ticketId, quantity) {
    const lockDuration = 2 * 60 * 1000; // 2 minutes in milliseconds
    const expiration = new Date(Date.now() + lockDuration);

    const ticket = await Ticket.findById(ticketId);

    if (!ticket || (ticket.available - totalLockedTickets(ticket)) < quantity) {
        throw new Error('Not enough available tickets to lock.');
    }

    // Add a new lock
    ticket.locks.push({ quantity, expiration });
    await ticket.save();

    // Set a timeout to automatically unlock these tickets
    setTimeout(() => {
        unlockTickets(ticketId, quantity, expiration).catch(console.error);
    }, lockDuration);

    return ticket;
}

// Helper function to calculate the total number of locked tickets
function totalLockedTickets(ticket) {
    return ticket.locks.reduce((sum, lock) => sum + lock.quantity, 0);
}
*/

/*
async function unlockTickets(ticketId, quantity, expiration) {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
        throw new Error('Ticket not found.');
    }

    // Find the specific lock by its expiration and quantity and remove it
    const lockIndex = ticket.locks.findIndex(lock => 
        lock.quantity === quantity && lock.expiration.getTime() === expiration.getTime());

    if (lockIndex > -1) {
        ticket.locks.splice(lockIndex, 1);
    } else {
        throw new Error('Lock not found.');
    }

    await ticket.save();

    return ticket;
}
*/