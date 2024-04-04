import axios from "axios";

import { PaymentDetails, PurchaseDetails, Ticket } from "../types";
import { API_GATEWAY_URL } from "../const";

const axiosInstance = axios.create({ withCredentials: true, baseURL: API_GATEWAY_URL });

const RealTicketApi = {

    fetchTickets: async (eventId: string, skip?: number, limit?: number): Promise<Ticket[] | null> => {
        const response = await axiosInstance.get(`/api/ticket/all/${eventId}`, {
            params: {
                skip,
                limit
            }
        });
        return response.data;
    },

    fetchBackOfficeTickets: async (eventId: string, skip?: number, limit?: number): Promise<Ticket[] | null> => {
        const response = await axiosInstance.get(`/api/ticket/all/backoffice/${eventId}`, {
            params: {
                skip,
                limit
            }
        });
        return response.data;
    },

    purchaseTickets: async (purchaseDetails: PurchaseDetails, paymentDetails: PaymentDetails, username: string) => {
        const putData = {
            event_id: purchaseDetails.event_id,
            ticket_amount: purchaseDetails.ticket_amount,
            ticket_name: purchaseDetails.ticket_name,
            ...paymentDetails, username
        }
        const result = await axiosInstance.put('/api/ticket', putData);
        return result.data.order_id;

    },

    lockTickets: async (eventId: string, ticketName: string, ticketAmount: number, username: string) => {
        const putData = {
            eventId: eventId,
            ticketName: ticketName,
            quantity: ticketAmount,
            username: username
        }
        await axiosInstance.put(`/api/ticket/${eventId}`, putData);
        return true;
    },
}

// import { MockTicketApi } from "./mock";
// const TicketApi = MockTicketApi;

const TicketApi = RealTicketApi;


export default TicketApi;