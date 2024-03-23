import axios, { isAxiosError } from "axios";
import { APIStatus } from "../types";
import { MAX_EVENTS_IN_PAGE } from "../const";
import { CSEvent } from "../types";
import { API_GATEWAY_URL } from "../const";
// import { getUserEventIds } from "./userAction";

const axiosInstance = axios.create({ withCredentials: true, baseURL: API_GATEWAY_URL }); // TODO - withCredentials?

// TODO - Paths (/api/event) to consts?
const EventApi = {
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

    getUserClosestEvent: async (username: string): Promise<CSEvent | null> => {
        // TODO - implement
        console.log(" > No events found for " + username);
        return null;
    }
};


// MOCK API
// const EventApi = {
//     allEvents: [
//         {
//             _id: "1",
//             title: "Fun Event",
//             description: "This is a fun event",
//             start_date: new Date("2024-04-11T20:00"),
//             end_date: new Date("2024-04-11T22:00"),
//             category: "Sports Event",
//             location: "Madison Square Garden",
//             image: "https://miro.medium.com/v2/resize:fit:1400/1*ydhn1QPAKsrbt6UWfn3YnA.jpeg"
//         },
//         {
//             _id: "2",
//             title: "Boring Event",
//             description: "This is a boring event",
//             start_date: new Date("2024-03-28T16:30"),
//             end_date: new Date("2024-03-29T01:00"),
//             category: "Conference",
//             location: "Some Conference Center idk",
//         },
//         {
//             _id: "3",
//             title: "Alina's Birthday Party",
//             category: "Convention",
//             description: "Alina celebrates her 26th birthday! Join, pain and suffering are guaranteed.",
//             organizer: "Alina",
//             start_date: new Date("2024-03-27T20:00"),
//             end_date: new Date("2024-03-28T02:00"),
//             location: "Nesher",
//             tickets: [
//                 { "name": "Entrance", "quantity": 800, "price": 20 },
//                 { "name": "Interview", "quantity": 300, "price": 30 },
//                 { "name": "Meetups", "quantity": 100, "price": 70 }
//             ],
//             image: "https://t4.ftcdn.net/jpg/01/20/28/25/360_F_120282530_gMCruc8XX2mwf5YtODLV2O1TGHzu4CAb.jpg"
//         }
//     ],

//     fetchEvents: async (skip?: number, limit?: number): Promise<CSEvent[]> => {
//         skip = skip ?? 0;
//         limit = limit ?? MAX_EVENTS_IN_PAGE;
//         await new Promise(resolve => setTimeout(resolve, 500));
//         // throw new Error("Force error for testing purposes.");
//         return EventApi.allEvents.slice(skip, skip + limit);
//     },

//     fetchEvent: async (eventId: string): Promise<CSEvent | null> => {
//         await new Promise(resolve => setTimeout(resolve, 500));
//         // if (getRandomInt(10) === 0) {
//         //     throw new Error("Force error for testing purposes.");
//         // }
//         return EventApi.allEvents.find(event => event._id === eventId) ?? null;
//     },

//     getUserClosestEvent: async (username: string): Promise<CSEvent | null> => {
//         console.log(" > Getting closest event for " + username);
//         await new Promise(resolve => setTimeout(resolve, 1000));
//         const userEventIds = getUserEventIds(username);
//         if (!userEventIds) {
//             console.log(" > No events found for " + username);
//             return null;
//         }

//         const userEvents: CSEvent[] = userEventIds.map(eventId => EventApi.allEvents.find(event => event._id === eventId)).filter(event => event !== undefined) as CSEvent[];
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
//             console.log(" > Next event found for " + username + ": " + nextEvent.title);
//             return nextEvent;
//         }

//         console.log(" > SHOULDN'T BE REACHABLE No events found for " + username);
//         return null;
//     }
// };

// for (let i = 100; i < 170; i++) {
//     EventApi.allEvents.push({
//         _id: (i).toString(),
//         title: "Event " + i,
//         description: "This is a boring event",
//         start_date: new Date("2024-03-28T16:30"),
//         end_date: new Date("2024-03-29T01:00"),
//         category: "Conference",
//         location: "Some Conference Center idk",
//     });
// }

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


export default EventApi;
