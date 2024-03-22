export interface CSEvent {
    id: string;
    name: string;
    description: string;
    start_date: Date; // TODO - string?
    end_date: Date; // TODO - string?
    category: string;
    location: string;
    image?: string;
    // TODO - MORE FIELDS!
}

export interface Comment {
    eventId: string;
    content: string;
    createdAt: Date;
    author: string;
    // TODO - MORE FIELDS!
}

export interface Ticket {
    eventId: string;
    name: string;
    price: number;
    quantity: number;
}

export interface PurchaseDetails {
    eventId: string;
    eventName: string
    name: string;
    quantity: number;
    price: number;
}

export interface UserAction {
    username: string;
    actionType: "purchase" | "refund"; // TODO - Maybe comment as well if we're feeling funky?
    eventId: string;
    purchaseId: string;
    ticketName: string;
    amount: number;
    timestamp: Date;
    // TODO - MORE FIELDS!
}