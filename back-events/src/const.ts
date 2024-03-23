import { UserRole } from "./types.js";

export const DEFAULT_ROLE: UserRole = UserRole["Worker"];

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