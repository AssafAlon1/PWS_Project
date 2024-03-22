import axios, { isAxiosError } from "axios";
import { APIStatus } from "../types";
import { CSEvent } from "../types";
import { getUserEventIds } from "./userAction";
import { EVENT_API_URL } from "../const";

const axiosInst = axios.create({ withCredentials: true, baseURL: EVENT_API_URL }); // TODO - withCredentials?

// const EventApi = {
//     fetchEvents: async (skip?: number, limit?: number): Promise<CSEvent[]> => {
//         try {
//             const response = await axiosInst.get("/api/event", {
//                 params: {
//                     skip,
//                     limit
//                 }
//             });
//             return response.data;
//         } catch (error) {
//             if (isAxiosError(error)) {
//                 throw new Error("Failed to fetch events: " + error.response?.data.message); // TODO - Better handling?
//             }
//             throw new Error("Failed to fetch events"); // TODO - Better handling?
//         }
//     },
//     fetchEvent: async (eventId: string): Promise<CSEvent | null> => {
//         try {
//             const response = await axios.get(`${EVENT_API_URL}/events/${eventId}`);
//             return response.data;
//         } catch (error) {
//             throw new Error("Failed to fetch event "); // TODO - Better handling?
//         }
//     },

//     getUserClosestEvent: async (username: string): Promise<CSEvent | null> => {
//         // TODO - implement
//         console.log(" > Getting closest event for " + username);
//         await new Promise(resolve => setTimeout(resolve, 1000));
//         const userEventIds = getUserEventIds(username);
//         if (!userEventIds) {
//             console.log(" > No events found for " + username);
//             return null;
//         }

//         const userEvents: CSEvent[] = userEventIds.map(eventId => allEvents.find(event => event.id === eventId)).filter(event => event !== undefined) as CSEvent[];
//         if (userEvents.length === 0) {
//             console.log(" > No events found for " + username);
//             return null;
//         }

//         const nextEvent = userEvents.reduce((minEvent, event) => {
//             if (!minEvent) {
//                 return event;
//             }
//             if (event.start_date.getTime() < minEvent.start_date.getTime()) {
//                 return event;
//             }
//             return minEvent;
//         }, userEvents[0]);

//         if (nextEvent) {
//             console.log(" > Next event found for " + username + ": " + nextEvent.name);
//             return nextEvent;
//         }

//         console.log(" > SHOULDN'T BE REACHABLE No events found for " + username);
//         return null;
//     }
// };

const EventApi = {
    allEvents: [
        {
            id: "1",
            name: "Fun Event",
            description: "This is a fun event",
            // start_date: "2024-04-11T20:00",
            start_date: new Date("2024-04-11T20:00"),
            end_date: new Date("2024-04-11T22:00"),
            category: "Sports Event",
            location: "Madison Square Garden",
            image: "https://miro.medium.com/v2/resize:fit:1400/1*ydhn1QPAKsrbt6UWfn3YnA.jpeg"
        },
        {
            id: "2",
            name: "Boring Event",
            // start_date: "2024-03-28T16:30",
            start_date: new Date("2024-03-28T16:30"),
            end_date: new Date("2024-03-29T01:00"),
            description: "This is a boring event",
            category: "Conference",
            location: "Some Conference Center idk",
        },
    ],

    fetchEvents: async (skip?: number, limit?: number): Promise<CSEvent[]> => {
        // TODO - implement
        skip = skip ?? 0;
        limit = limit ?? 50; // TODO - magic number
        await new Promise(resolve => setTimeout(resolve, 500));
        // throw new Error("Force error for testing purposes.");
        return EventApi.allEvents.slice(skip, skip + limit);
    },

    fetchEvent: async (eventId: string): Promise<CSEvent | null> => {
        // TODO - implement
        await new Promise(resolve => setTimeout(resolve, 500));
        // if (getRandomInt(10) === 0) {
        //     throw new Error("Force error for testing purposes.");
        // }
        return EventApi.allEvents.find(event => event.id === eventId) ?? null;
    },

    getUserClosestEvent: async (username: string): Promise<CSEvent | null> => {
        // TODO - implement
        console.log(" > Getting closest event for " + username);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const userEventIds = getUserEventIds(username);
        if (!userEventIds) {
            console.log(" > No events found for " + username);
            return null;
        }

        const userEvents: CSEvent[] = userEventIds.map(eventId => EventApi.allEvents.find(event => event.id === eventId)).filter(event => event !== undefined) as CSEvent[];
        if (userEvents.length === 0) {
            console.log(" > No events found for " + username);
            return null;
        }

        const nextEvent = userEvents.reduce((minEvent, event) => {
            if (!minEvent) {
                return event;
            }
            if (event.start_date.getTime() < minEvent.start_date.getTime()) {
                return event;
            }
            return minEvent;
        }, userEvents[0]);

        if (nextEvent) {
            console.log(" > Next event found for " + username + ": " + nextEvent.name);
            return nextEvent;
        }

        console.log(" > SHOULDN'T BE REACHABLE No events found for " + username);
        return null;
    }
};

// TODO - Move to shared utils
const handleError = async (e: unknown): Promise<APIStatus> => {
    // Handle errors here, check status code and return the appropriate APIStatus
    if (axios.isAxiosError(e) && e.response) {
        if (e.response.status === 400) {
            return APIStatus.BadRequest;
        }
        if (e.response.status === 401) {
            return APIStatus.Unauthorized;
        }
    }
    return APIStatus.ServerError;
};


export default EventApi;
