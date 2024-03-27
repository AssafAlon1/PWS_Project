import dotenv from 'dotenv';

dotenv.config();

export const MAX_QUERY_LIMIT = 50;

export const VALID_CATEGORIES = [
    "Charity%20Event",
    "Concert",
    "Conference",
    "Convention",
    "Exhibition",
    "Festival",
    "Product%20Launch",
    "Sports%20Event"
]

export const EVENT_PATH = "/api/event";

export const COMMENT_EXCHANGE = 'comments_exchange';
export const COMMENT_QUEUE = 'comments_queue';

export const TICKET_INFO_EXCHANGE = 'ticket_info_exchange';
export const TICKET_INFO_QUEUE = 'ticket_info_queue';

export const BUY_TICKETS_EXCHANGE = "buy_tickets_exchange";
export const BUY_TICKETS_QUEUE = "buy_tickets_queue_event";

export const REFUND_TICKETS_EXCHANGE = "refund_tickets_exchange";
export const REFUND_TICKETS_QUEUE = "refund_tickets_queue_event";

export const TICKET_API_URL = process.env.TICKET_API_URL;
