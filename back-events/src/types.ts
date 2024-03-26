import { ICSEvent } from './models/CSEvent.js';

export enum Routes {
    GET_EVENT = "GET /api/event/",
    POST_EVENT = "POST /api/event/",
    UPDATE_EVENT = "PUT /api/event/",
    DELETE_EVENT = "DELETE /api/event/",
    NOT_FOUND = "NOT_FOUND"
}

export type CSEventWithTickets = ICSEvent & {
    tickets: { name: string, total: number, price: number }[]
}

