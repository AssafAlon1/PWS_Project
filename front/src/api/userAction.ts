import axios, { isAxiosError } from "axios";

import { APIStatus, CSEvent } from "../types";
import { API_GATEWAY_URL } from "../const";

const axiosInstance = axios.create({ withCredentials: true, baseURL: API_GATEWAY_URL }); // TODO - withCredentials?

// TODO - rename to UserActionApi
const RealUserActionApi = {
    // TODO - will be moved to the tickets service (and forwarded to the user-actions service via rabbit)
    purchaseTickets: async (eventId: string, ticketName: string, amount: number, username: string) => {
        const purchaseTime = new Date();
        const purchaseId = `${purchaseTime.getTime()}`;
        try {
            axiosInstance.post("/api/user_actions", { event_id: eventId, purchase_id: purchaseId, ticket_name: ticketName, amount, username, purchase_time: purchaseTime });
        }
        catch (error) {
            throw new Error("Failed to purchase tickets");
        }
    },
    refundPurchase: async (purchaseId: string) => {
        try {
            await axiosInstance.put("/api/user_actions", { purchase_id: purchaseId });
            console.log("Completed refund");
            return APIStatus.Success;

        } catch (error) {
            if (isAxiosError(error)) {
                throw new Error("Failed to refund purchase: " + error.response?.data.message); // TODO - Better handling?
            }
            throw new Error("Failed to refund purchase"); // TODO - Better handling?

        }
    },

    getUserClosestEvent: async (username: string): Promise<CSEvent | null> => {
        return null; // Should first implement the logic in the events service
        try {
            const response = await axiosInstance.get("/api/closest_event", {
                params: {
                    username
                }
            });
            return response.data;
        }
        catch (error) {
            console.error("Couldn't find closest event for " + username);
            return null;
        }
    }

}

// import { MockUserActionApi } from "./mock";
// const UserActionApi = MockUserActionApi;

const UserActionApi = RealUserActionApi;


export default UserActionApi;