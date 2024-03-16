import { CSEvent } from "../types";

// TODO - IMPLEMENT EVERYTHING WITH AXIOS
const allEvents = [
    {
        id: "1",
        name: "Fun Event",
        description: "This is a fun event",
    },
    {
        id: "2",
        name: "Boring Event",
        description: "This is a boring event",
    }
];

export async function fetchEvents(skip?: number, limit?: number): Promise<CSEvent[]> {
    // TODO - implement
    skip = skip ?? 0;
    limit = limit ?? 50; // TODO - magic number
    return allEvents.slice(skip, skip + limit);
}

export async function fetchEvent(eventId: string): Promise<CSEvent | null> {
    // TODO - implement
    return allEvents.find(event => event.id === eventId) ?? null;
}

