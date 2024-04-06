import axios from "axios";

import { APIStatus, UserAction } from "../types";
import { API_GATEWAY_URL } from "../const";
import { getFormattedDateTime } from "../utils/formatting";

const axiosInstance = axios.create({ withCredentials: true, baseURL: API_GATEWAY_URL });

const RealUserActionApi = {
    refundPurchase: async (purchaseId: string) => {
        await axiosInstance.put("/api/user_actions", { purchase_id: purchaseId });
        console.log("Completed refund");
        return APIStatus.Success;
    },

    getUserClosestEvent: async (username: string): Promise<string | null> => {
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
    },

    getUserActions: async (username: string, skip?: number, limit?: number) => {
        const response = await axiosInstance.get("/api/user_actions", {
            params: {
                username,
                skip,
                limit
            }
        });
        return response.data as UserAction[];
    },
}

const UserActionApi = RealUserActionApi;


export default UserActionApi;