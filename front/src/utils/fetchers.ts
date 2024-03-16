import { CSEvent } from "../types";

// TODO - IMPLEMENT EVERYTHING WITH AXIOS
const allEvents = [
    {
        id: "1",
        name: "Fun Event",
        description: "This is a fun event",
        // start_date: "2024-04-11T20:00",
        start_date: new Date("2024-04-11T20:00"),
        category: "Sports Event",
        image: "https://miro.medium.com/v2/resize:fit:1400/1*ydhn1QPAKsrbt6UWfn3YnA.jpeg"
    },
    {
        id: "2",
        name: "Boring Event",
        // start_date: "2024-03-28T16:30",
        start_date: new Date("2024-03-28T16:30"),
        description: "This is a boring event",
        category: "Conference",
    },
];

export async function fetchEvents(skip?: number, limit?: number): Promise<CSEvent[]> {
    // TODO - implement
    skip = skip ?? 0;
    limit = limit ?? 50; // TODO - magic number
    await new Promise(resolve => setTimeout(resolve, 1000));
    return allEvents.slice(skip, skip + limit);
}

export async function fetchEvent(eventId: string): Promise<CSEvent | null> {
    // TODO - implement
    return allEvents.find(event => event.id === eventId) ?? null;
}

