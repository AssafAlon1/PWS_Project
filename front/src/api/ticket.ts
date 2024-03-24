import axios, { isAxiosError } from "axios";

import { APIStatus, Ticket } from "../types";
import { API_GATEWAY_URL } from "../const";

const axiosInstance = axios.create({ withCredentials: true, baseURL: API_GATEWAY_URL }); // TODO - withCredentials?

// TODO - rename to TicketApi
const RealTicketApi = {

    fetchAvailableTickets: async (eventId: string, skip?: number, limit?: number): Promise<Ticket[] | null> => {
        console.log("fetchAvailableTickets for eventID: ", eventId);
        try {
            const response = await axiosInstance.get(`api/ticket/${eventId}`, {
                params: {
                    skip,
                    limit
                }
            });
            console.log("Got tickets: ", response.data);
            return response.data;
        } catch (error) {  
            if (isAxiosError(error)) {
                throw new Error("Failed to fetch tickets: " + error.response?.data.message); // TODO - Better handling?
            }
            throw new Error("Failed to fetch tickets"); // TODO - Better handling?
        }
    },
    purchaseTickets: async (eventId: string, ticketName: string, amount: number, username: string) => {
        // TODO - implement lock!
        try {
            // Get relevant ticket
            const ticket = (await axiosInstance.get(`api/ticket/${eventId}/${ticketName}`)).data;
            if (!ticket) { //shouldn't get here
                console.log("Ticket not found");
                throw new Error("Ticket not found");
            }
            if (ticket.quantity < amount) { // check we still have that amount of tickets left
                console.log("Not enough tickets available");
                throw new Error("Not enough tickets available");
            }
            console.log("Ticket found: ", ticket);
            // Create new ticket with updated quantity
            const updatedTicket = { 
                eventId: eventId, 
                name: ticketName, 
                quantity: ticket.quantity - amount,
                price: ticket.price
            };
            console.log("About to purchase tickets");
            await axiosInstance.put(`/api/ticket/${ticket._id}`, updatedTicket);
            console.log("Completed purchase");
            return APIStatus.Success;

        } catch (error) {
            if (isAxiosError(error)) {
                throw new Error("Failed to purchase tickets: " + error.response?.data.message); // TODO - Better handling?
            }
            throw new Error("Failed to purchase tickets"); // TODO - Better handling?
        
        }
        // return "1234";
    },
}

import { MockTicketApi } from "./mock";
// const TicketApi = MockTicketApi;

const TicketApi = RealTicketApi;


export default TicketApi;