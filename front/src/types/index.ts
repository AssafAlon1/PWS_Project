export interface CSEvent {
    _id: string;
    title: string;
    description: string;
    start_date: Date; 
    end_date: Date;
    category: string;
    location: string;
    image?: string;
    comment_count: number;
}

export interface Comment {
    eventId: string;
    content: string;
    createdAt: Date;
    author: string;
}

export interface Ticket {
    eventId: string;
    name: string;
    available: number;
    total: number;
    price: number;
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
    actionType: "purchase" | "refund";
    eventId: string;
    purchaseId: string;
    ticketName: string;
    amount: number;
    timestamp: Date;
}

export enum APIStatus {
    Success,
    BadRequest,
    Unauthorized,
    ServerError
}
