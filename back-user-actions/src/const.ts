import dotenv from "dotenv";

dotenv.config();

export const MAX_QUERY_LIMIT = 50;

export const ACTIONS_PATH = "/api/user_actions";
export const CLOSEST_EVENT_PATH = "/api/closest_event";

export const BUY_TICKETS_EXCHANGE = "buy_tickets_exchange";
export const BUY_TICKETS_QUEUE = "buy_tickets_queue";

export const ORDER_API_URL = process.env.ORDER_API_URL
export const EVENT_API_URL = process.env.EVENT_API_URL
