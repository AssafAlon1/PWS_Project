import axios, { isAxiosError } from "axios";

import { APIStatus, Ticket } from "../types";
import { API_GATEWAY_URL } from "../const";

const axiosInstance = axios.create({ withCredentials: true, baseURL: API_GATEWAY_URL }); // TODO - withCredentials?

// TODO - rename to TicketApi
const RealTicketApi = {

    fetchAvailableTickets: async (eventId: string, skip?: number, limit?: number): Promise<Ticket[] | null> => {
        console.log("fetchAvailableTickets for eventID: ", eventId);
        try {
            const response = await axiosInstance.get(`/api/ticket/all/${eventId}`, { // Updated to fetch all tickets for an event
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
            // TODO - Make sure we have enough tickets to sell or that they are reseved in the locked array for the user!
            await axiosInstance.put('/api/ticket', {eventId, ticketName, amount /*, username */});
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