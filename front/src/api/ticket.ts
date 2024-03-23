import { Ticket } from "../types";


const RealTicketApi = {

    fetchTickets: async (eventId: string): Promise<Ticket[] | null> => {
        return null;
    },
    purchaseTickets: async (eventId: string, ticketName: string, amount: number, username: string): Promise<string> => {
        return "1234";
    },
}

import { MockTicketApi } from "./mock";
const TicketApi = MockTicketApi;

// const TicketApi = RealTicketApi;


export default TicketApi;