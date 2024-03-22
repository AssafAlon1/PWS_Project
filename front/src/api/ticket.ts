// TODO - implement!

import { Ticket } from "../types";
import { registerUserAction } from "./userAction";

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

const allTickets = [
    {
        eventId: "1",
        name: "General Admission",
        price: 50,
        quantity: 997,
    },
    {
        eventId: "1",
        name: "VIP",
        price: 100,
        quantity: 100,
    },
    {
        eventId: "2",
        name: "General Admission",
        price: 20,
        quantity: 500,
    },
];



export async function fetchTickets(eventId: string): Promise<Ticket[] | null> {
    // TODO - implement
    await new Promise(resolve => setTimeout(resolve, 500));
    if (getRandomInt(10) === 0) {
        throw new Error("Force error for testing purposes.");
    }
    return allTickets.filter(ticket => ticket.eventId === eventId);
}



// TODO - move to different file?
export async function purchaseTickets(eventId: string, ticketName: string, amount: number, username: string): Promise<string> {
    // TODO - implement
    await new Promise(resolve => setTimeout(resolve, 1000));
    // TODO - check this
    if (getRandomInt(3) === 0) {
        throw new Error("Force error for testing purposes.");
    }

    const purchaseId = "1"; // TODO - DO THE ACTUAL PURCHASE AGAINST THE HAMMER HEAD API

    registerUserAction(username, "purchase", eventId, purchaseId, ticketName, amount);
    return purchaseId;
}