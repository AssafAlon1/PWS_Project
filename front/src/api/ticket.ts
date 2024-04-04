import axios, { isAxiosError } from "axios";

import { PaymentDetails, PurchaseDetails, Ticket } from "../types";
import { API_GATEWAY_URL } from "../const";

const axiosInstance = axios.create({ withCredentials: true, baseURL: API_GATEWAY_URL });

const RealTicketApi = {

    fetchTickets: async (eventId: string, skip?: number, limit?: number): Promise<Ticket[] | null> => {
        console.log("fetchAvailableTickets for eventID: ", eventId);
        try {
            const response = await axiosInstance.get(`/api/ticket/all/${eventId}`, {
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

    fetchBackOfficeTickets: async (eventId: string, skip?: number, limit?: number): Promise<Ticket[] | null> => {
        console.log("fetchBackOfficeTickets for eventID: ", eventId);
        try {
            const response = await axiosInstance.get(`/api/ticket/all/backoffice/${eventId}`, {
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

    purchaseTickets: async (purchaseDetails: PurchaseDetails, paymentDetails: PaymentDetails, username: string) => {
        try {
            const putData = {
                event_id: purchaseDetails.event_id,
                ticket_amount: purchaseDetails.ticket_amount,
                ticket_name: purchaseDetails.ticket_name,
                ...paymentDetails, username
            }
            const result = await axiosInstance.put('/api/ticket', putData);
            console.log("Completed purchase");
            return result.data.order_id;

        } catch (error) {
            if (isAxiosError(error)) {
                throw new Error("Failed to purchase tickets: " + error.response?.data.message); // TODO - Better handling?
            }
            throw new Error("Failed to purchase tickets"); // TODO - Better handling?
        }
    },

    lockTickets: async (eventId: string, ticketName: string, ticketAmount: number, username: string) => {
        try {
            const putData = {
                eventId: eventId,
                ticketName: ticketName,
                quantity: ticketAmount,
                username: username
            }
            await axiosInstance.put(`/api/ticket/${eventId}`, putData);
            console.log("Completed lock");
            return true;
        } catch (error) {
            if (isAxiosError(error)) {
                throw new Error("Failed to lock tickets: " + error.response?.data.message); // TODO - Better handling?
            }
            throw new Error("Failed to lock tickets"); // TODO - Better handling?
        }
    },
}

// import { MockTicketApi } from "./mock";
// const TicketApi = MockTicketApi;

const TicketApi = RealTicketApi;


export default TicketApi;