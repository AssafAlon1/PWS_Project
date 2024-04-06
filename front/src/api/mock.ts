import { Comment, Ticket, CSEvent } from "../types";
import { MAX_EVENTS_IN_PAGE } from "../const";

// Mock API
function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export const MockEventApi = {
    allEvents: [
        {
            _id: "1",
            title: "Fun Event",
            description: "This is a fun event",
            start_date: new Date("2024-04-11T20:00"),
            end_date: new Date("2024-04-11T22:00"),
            category: "Sports Event",
            location: "Madison Square Garden",
            image: "https://miro.medium.com/v2/resize:fit:1400/1*ydhn1QPAKsrbt6UWfn3YnA.jpeg",
            cheapest_ticket_price: 50,
            total_available_tickets: 1097,
            comment_count: 3,
        },
        {
            _id: "2",
            title: "Boring Event",
            description: "This is a boring event",
            start_date: new Date("2024-03-28T16:30"),
            end_date: new Date("2024-03-29T01:00"),
            category: "Conference",
            location: "Some Conference Center idk",
            cheapest_ticket_price: 20,
            total_available_tickets: 500,
            comment_count: 1,
        },
        {
            _id: "3",
            title: "Alina's Birthday Party",
            category: "Convention",
            description: "Alina celebrates her 26th birthday! Join, pain and suffering are guaranteed.",
            organizer: "Alina",
            start_date: new Date("2024-03-27T20:00"),
            end_date: new Date("2024-03-28T02:00"),
            location: "Nesher",
            image: "https://t4.ftcdn.net/jpg/01/20/28/25/360_F_120282530_gMCruc8XX2mwf5YtODLV2O1TGHzu4CAb.jpg",
            cheapest_ticket_price: 5,
            total_available_tickets: 38,
            comment_count: 0,
        }
    ],

    fetchEvents: async (skip?: number, limit?: number): Promise<CSEvent[]> => {
        skip = skip ?? 0;
        limit = limit ?? MAX_EVENTS_IN_PAGE;
        await new Promise(resolve => setTimeout(resolve, 500));
        // throw new Error("Force error for testing purposes.");
        return MockEventApi.allEvents.slice(skip, skip + limit);
    },

    fetchEvent: async (eventId: string): Promise<CSEvent | null> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        // if (getRandomInt(10) === 0) {
        //     throw new Error("Force error for testing purposes.");
        // }
        return MockEventApi.allEvents.find(event => event._id === eventId) ?? null;
    },
};

for (let i = 100; i < 170; i++) {
    MockEventApi.allEvents.push({
        _id: (i).toString(),
        title: "Event " + i,
        description: "This is a boring event",
        start_date: new Date("2024-03-28T16:30"),
        end_date: new Date("2024-03-29T01:00"),
        category: "Conference",
        location: "Some Conference Center idk",
        cheapest_ticket_price: 1000,
        total_available_tickets: 500,
        comment_count: 0,
    });
}

export const MockCommentApi = {
    allComments: [
        {
            eventId: "1",
            content: "This event seems fun!",
            createdAt: new Date("2024-03-17T11:32"),
            author: "Alice",
        },
        {
            eventId: "1",
            content: "Jeffrey Epstein didn't kill himself",
            createdAt: new Date("2024-03-17T11:54"),
            author: "A person who knows...",
        },
        {
            eventId: "1",
            content: "Haha, I like fun events :)",
            createdAt: new Date("2024-03-18T01:05"),
            author: "Bob",
        },
        {
            eventId: "2",
            content: "Boooo-RING!",
            createdAt: new Date("2024-03-18T01:07"),
            author: "Bob"
        },
    ],

    postComment: async (username: string, eventId: string, comment: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (getRandomInt(2) === 0) {
            throw new Error("Force error for testing purposes.");
        }
        const newComment: Comment = {
            eventId,
            content: comment,
            createdAt: new Date(),
            author: username,
        };
        MockCommentApi.allComments.push(newComment);
        return newComment;
    },

    fetchComments: async (eventId: string): Promise<Comment[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (getRandomInt(10) === 0) {
            throw new Error("Force error for testing purposes.");
        }

        return MockCommentApi.allComments.filter(comment => comment.eventId === eventId).reverse();
    }
}

export const MockTicketApi = {
    allTickets: [
        {
            eventId: "1",
            name: "General Admission",
            price: 50,
            available: 997,
            total: 1000,
        },
        {
            eventId: "1",
            name: "VIP",
            price: 100,
            available: 100,
            total: 100,
        },
        {
            eventId: "2",
            name: "General Admission",
            price: 20,
            available: 500,
            total: 500,
        },
        {
            eventId: "2",
            name: "Golden Ring",
            price: 200,
            available: 0,
            total: 100,
        },
        {
            eventId: "3",
            name: "Entrance",
            price: 5,
            available: 38,
            total: 100,
        },
    ],
    fetchAvailableTickets: async (eventId: string): Promise<Ticket[] | null> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (getRandomInt(10) === 0) {
            throw new Error("Force error for testing purposes.");
        }
        return MockTicketApi.allTickets.filter(ticket => ticket.eventId === eventId);
    },
    purchaseTickets: async (eventId: string, ticketName: string, amount: number, username: string): Promise<string> => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (getRandomInt(3) === 0) {
            throw new Error("Force error for testing purposes.");
        }

        const purchaseId = `${new Date().getTime()}`;

        MockUserActionApi.registerUserAction(username, eventId, purchaseId, ticketName, amount);
        return purchaseId;
    },
}

export const MockUserActionApi = {
    allUserActions: [
        {
            username: "Alice",
            event_id: "3",
            purchase_id: "2",
            ticket_name: "General Admission",
            amount: 3,
            purchase_time: new Date("2024-03-17T11:32"),
            refund_time: undefined
        },
    ],

    registerUserAction: (
        username: string,
        eventId: string,
        purchaseId: string,
        ticketName: string,
        amount: number,) => {
        const timestamp = new Date();
        MockUserActionApi.allUserActions.push({
            username,
            event_id: eventId,
            purchase_id: purchaseId,
            ticket_name: ticketName,
            amount,
            purchase_time: timestamp,
            refund_time: undefined
        });

    },
    getUserClosestEvent: async (username: string): Promise<CSEvent | null> => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const userEventIds = MockUserActionApi.allUserActions
            .filter(action => action.username === username && !action.refund_time)
            .map(purchase => purchase.event_id);
        if (!userEventIds) {
            return null;
        }

        const userEvents: CSEvent[] = userEventIds.map(eventId => MockEventApi.allEvents.find(event => event._id === eventId)).filter(event => event !== undefined) as CSEvent[];
        if (userEvents.length === 0) {
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
            return nextEvent;
        }

        return null;
    }
}
