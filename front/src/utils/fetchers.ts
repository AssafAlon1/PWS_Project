import { CSEvent, Comment, Ticket } from "../types";

// TODO - remove this function (only for testing)
function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

// TODO - IMPLEMENT EVERYTHING WITH AXIOS
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

const allTickets = [
    {
        eventId: "1",
        name: "General Admission",
        price: 50,
        quantity: 1000,
    },
    {
        eventId: "1",
        name: "VIP",
        price: 100,
        quantity: 100,
    },
    {
        eventId: "2",
        name: "General Admission",
        price: 20,
        quantity: 500,
    },
];

const allComments = [
    {
        id: "1",
        eventId: "1",
        content: "This event seems fun!",
        createdAt: new Date("2024-03-17T11:32"),
        author: "Alice",
    },
    {
        id: "2",
        eventId: "1",
        content: "Jeffrey Epstein didn't kill himself",
        createdAt: new Date("2024-03-17T11:54"),
        author: "A person who knows...",
    },
    {
        id: "3",
        eventId: "1",
        content: "Haha, I like fun events :)",
        createdAt: new Date("2024-03-18T01:05"),
        author: "Bob",
    },
    {
        id: "4",
        eventId: "2",
        content: "Boooo-RING!",
        createdAt: new Date("2024-03-18T01:07"),
        author: "Bob"
    },
];


export async function fetchEvents(skip?: number, limit?: number): Promise<CSEvent[]> {
    // TODO - implement
    skip = skip ?? 0;
    limit = limit ?? 50; // TODO - magic number
    await new Promise(resolve => setTimeout(resolve, 1000));
    // throw new Error("Force error for testing purposes.");
    return allEvents.slice(skip, skip + limit);
}

export async function fetchEvent(eventId: string): Promise<CSEvent | null> {
    // TODO - implement
    await new Promise(resolve => setTimeout(resolve, 1000));
    // if (getRandomInt(5) === 0) {
    //     throw new Error("Force error for testing purposes.");
    // }
    return allEvents.find(event => event.id === eventId) ?? null;
}

export async function fetchTickets(eventId: string): Promise<Ticket[] | null> {
    // TODO - implement
    await new Promise(resolve => setTimeout(resolve, 1700));
    if (getRandomInt(5) === 0) {
        throw new Error("Force error for testing purposes.");
    }
    return allTickets.filter(ticket => ticket.eventId === eventId);
}


export async function fetchComments(eventId: string): Promise<Comment[]> {
    // TODO - implement
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (getRandomInt(5) === 0) {
        throw new Error("Force error for testing purposes.");
    }

    return allComments.filter(comment => comment.eventId === eventId).reverse();
}