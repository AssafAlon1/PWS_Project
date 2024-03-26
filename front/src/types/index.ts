export interface CSEvent {
    _id: string;
    title: string;
    description: string;
    start_date: Date;
    end_date: Date;
    category: string;
    location: string;
    image?: string;
    cheapest_ticket_name?: string;
    cheapest_ticket_price: number;
    total_available_tickets: number;
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
    event_id: string;
    event_name: string
    ticket_name: string;
    ticket_amount: number;
    price: number;
}

export interface PaymentDetails {
    cc: string;
    holder: string;
    cvv: string;
    exp: string;
    charge: number;
}

// This will change...
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
