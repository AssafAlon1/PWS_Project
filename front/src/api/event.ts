import axios, { isAxiosError } from "axios";
import { CSEvent, CSEventCreationReqeust } from "../types";
import { API_GATEWAY_URL } from "../const";
// import { getUserEventIds } from "./userAction";

const axiosInstance = axios.create({ withCredentials: true, baseURL: API_GATEWAY_URL }); // TODO - withCredentials?

// TODO - Paths (/api/event) to consts?
//TODO - rename to EventApi
const RealEventApi = {
    fetchEvents: async (skip?: number, limit?: number): Promise<CSEvent[]> => {
        try {
            const response = await axiosInstance.get("/api/event", {
                params: {
                    skip,
                    limit
                }
            });
            return response.data;
        } catch (error) {
            if (isAxiosError(error)) {
                throw new Error("Failed to fetch events: " + error.response?.data.message); // TODO - Better handling?
            }
            throw new Error("Failed to fetch events"); // TODO - Better handling?
        }
    },
    fetchEvent: async (eventId: string): Promise<CSEvent | null> => {
        try {
            const response = await axiosInstance.get(`/api/event/${eventId}`);
            return response.data;
        } catch (error) {
            throw new Error("Failed to fetch event "); // TODO - Better handling?
        }
    },
    fetchBackOfficeEvent: async (eventId: string): Promise<CSEvent | null> => {
        try {
            const response = await axiosInstance.get(`/api/event/backoffice/${eventId}`);
            return response.data;
        } catch (error) {
            throw new Error("Failed to fetch back office events"); // TODO - Better handling?
        }
    },
    fetchAllEvents: async (skip?: number, limit?: number): Promise<CSEvent[]> => {
        try {
            const response = await axiosInstance.get("/api/event/all", {
                params: {
                    skip,
                    limit
                }
            
            });
            return response.data;
        } catch (error) {
            throw new Error("Failed to fetch all events"); // TODO - Better handling?
        }
    },
    createEvent: async (event: CSEventCreationReqeust): Promise<string> => {
        try {
            const response = await axiosInstance.post("/api/event", event);
            return response.data._id; // Created event ID
        } catch (error) {
            throw new Error("Failed to create event"); // TODO - Better handling?
        }
    },

};


// TODO - Move to shared utils

// const handleError = async (e: unknown): Promise<APIStatus> => {
//     // Handle errors here, check status code and return the appropriate APIStatus
//     if (axios.isAxiosError(e) && e.response) {
//         if (e.response.status === 400) {
//             return APIStatus.BadRequest;
//         }
//         if (e.response.status === 401) {
//             return APIStatus.Unauthorized;
//         }
//     }
//     return APIStatus.ServerError;
// };


// import { MockEventApi } from "./mock";
// const EventApi = MockEventApi;
const EventApi = RealEventApi;

export default EventApi;
