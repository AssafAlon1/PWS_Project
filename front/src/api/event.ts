import { CSEvent } from "../types";
import { getUserEventIds } from "./userAction";

// TODO - Implement!
const allEvents = [
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
];

export async function fetchEvents(skip?: number, limit?: number): Promise<CSEvent[]> {
    // TODO - implement
    skip = skip ?? 0;
    limit = limit ?? 50; // TODO - magic number
    await new Promise(resolve => setTimeout(resolve,));
    // throw new Error("Force error for testing purposes.");
    return allEvents.slice(skip, skip + limit);
}

export async function fetchEvent(eventId: string): Promise<CSEvent | null> {
    // TODO - implement
    await new Promise(resolve => setTimeout(resolve, 500));
    // if (getRandomInt(10) === 0) {
    //     throw new Error("Force error for testing purposes.");
    // }
    return allEvents.find(event => event.id === eventId) ?? null;
}

export async function getUserClosestEvent(username: string): Promise<CSEvent | null> {
    // TODO - implement
    console.log(" > Getting closest event for " + username);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const userEventIds = getUserEventIds(username);
    if (!userEventIds) {
        console.log(" > No events found for " + username);
        return null;
    }

    const userEvents: CSEvent[] = userEventIds.map(eventId => allEvents.find(event => event.id === eventId)).filter(event => event !== undefined) as CSEvent[];
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