import axios, { isAxiosError } from "axios";
import { CSEvent, CSEventCreationReqeust } from "../types";
import { API_GATEWAY_URL } from "../const";
// import { getUserEventIds } from "./userAction";

const axiosInstance = axios.create({ withCredentials: true, baseURL: API_GATEWAY_URL });

const RealEventApi = {
    fetchEvents: async (skip?: number, limit?: number): Promise<CSEvent[]> => {
        const response = await axiosInstance.get("/api/event", {
            params: {
                skip,
                limit
            }
        });
        return response.data;
    },
    fetchEvent: async (eventId: string): Promise<CSEvent | null> => {
        const response = await axiosInstance.get(`/api/event/${eventId}`);
        return response.data;
    },
    fetchBackOfficeEvent: async (eventId: string): Promise<CSEvent | null> => {
        const response = await axiosInstance.get(`/api/event/backoffice/${eventId}`);
        return response.data;
    },
    fetchAllEvents: async (skip?: number, limit?: number): Promise<CSEvent[]> => {
        const response = await axiosInstance.get("/api/event/all", {
            params: {
                skip,
                limit
            }

        });
        return response.data;
    },
    createEvent: async (event: CSEventCreationReqeust): Promise<string> => {
        const response = await axiosInstance.post("/api/event", event);
        return response.data._id; // Created event ID
    },
    postponeEvent: async (eventId: string, newStart: Date, newEnd: Date): Promise<void> => {
        await axiosInstance.put(`/api/event/${eventId}/postpone`, { start_date: newStart, end_date: newEnd });
    },
};


// import { MockEventApi } from "./mock";
// const EventApi = MockEventApi;
const EventApi = RealEventApi;

export default EventApi;
