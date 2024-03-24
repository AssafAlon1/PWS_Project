import axios, { isAxiosError } from "axios";

import { Ticket } from "../types";
import { API_GATEWAY_URL } from "../const";

const axiosInstance = axios.create({ withCredentials: true, baseURL: API_GATEWAY_URL }); // TODO - withCredentials?

// TODO - rename to TicketApi
const RealTicketApi = {

    fetchAvailableTickets: async (eventId: string, skip?: number, limit?: number): Promise<Ticket[] | null> => {
        try {
            const response = await axiosInstance.get(`api/ticket/${eventId}`, {
                params: {
                    skip,
                    limit
                }
            });
            return response.data;
        } catch (error) {  
            if (isAxiosError(error)) {
                throw new Error("Failed to fetch tickets: " + error.response?.data.message); // TODO - Better handling?
            }
            throw new Error("Failed to fetch tickets"); // TODO - Better handling?
        }
    },
    purchaseTickets: async (eventId: string, ticketName: string, amount: number, username: string): Promise<string> => {
        return "1234";
    },
}

import { MockTicketApi } from "./mock";
// const TicketApi = MockTicketApi;

const TicketApi = RealTicketApi;


export default TicketApi;