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
    name: string;
    quantity: number;
    price: number;
}