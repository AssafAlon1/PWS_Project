import axios, { isAxiosError } from "axios";

import { APIStatus, UserAction } from "../types";
import { API_GATEWAY_URL } from "../const";
import { getFormattedDateTime } from "../utils/formatting";

const axiosInstance = axios.create({ withCredentials: true, baseURL: API_GATEWAY_URL });

const RealUserActionApi = {
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

    getUserClosestEvent: async (username: string): Promise<string | null> => {
        try {
            const response = (await axiosInstance.get("/api/closest_event", {
                params: {
                    username
                }
            })).data;
            if (!response.eventTitle || !response.eventStartDate) {
                console.error("Couldn't find closest event for " + username);
                return null;
            }
            return `${response.eventTitle} (${getFormattedDateTime(response.eventStartDate)})`;
        }
        catch (error) {
            console.error("Couldn't find closest event for " + username);
            return null;
        }
    },

    getUserActions: async (username: string, skip?: number, limit?: number) => {
        try {
            const response = await axiosInstance.get("/api/user_actions", {
                params: {
                    username,
                    skip,
                    limit
                }
            });
            return response.data;
        } catch (error) {
            if (isAxiosError(error)) {
                throw new Error("Failed to fetch user actions: " + error.response?.data.message); // TODO - Better handling?
            }
            throw new Error("Failed to fetch user actions"); // TODO - Better handling?
        }
    },

    getUserActionByPurchaseId: async (purchaseId: string): Promise<UserAction> => {
        try {
            const response = await axiosInstance.get(`/api/user_actions/${purchaseId}`);
            return response.data as UserAction;
        } catch (error) {
            if (isAxiosError(error)) {
                throw new Error("Failed to fetch user action: " + error.response?.data.message); // TODO - Better handling?
            }
            throw new Error("Failed to fetch user action"); // TODO - Better handling?
        }
    }

}

// import { MockUserActionApi } from "./mock";
// const UserActionApi = MockUserActionApi;

const UserActionApi = RealUserActionApi;


export default UserActionApi;