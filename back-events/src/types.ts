import Joi from 'joi';
import { eventSchema, ICSEvent } from './models/CSEvent.js';
import { VALID_CATEGORIES } from './const.js';

export enum Routes {
    GET_EVENT = "GET /api/event/",
    POST_EVENT = "POST /api/event/",
    UPDATE_EVENT = "PUT /api/event/",
    DELETE_EVENT = "DELETE /api/event/",
    NOT_FOUND = "NOT_FOUND"
}

const ticketSchema = Joi.object({
    name: Joi.string().required(),
    total: Joi.number().integer().min(0).required(),
    price: Joi.number().min(0).required(),
});

export const JoiEventCreationRequestSchema = Joi.object({
    title: Joi.string(),
    category: Joi.string().valid(...VALID_CATEGORIES),
    description: Joi.string(),
    organizer: Joi.string(),
    start_date: Joi.date().iso(),
    end_date: Joi.date().iso().when('start_date', {
        is: Joi.exist(),
        then: Joi.date().iso().greater(Joi.ref('start_date')),
        otherwise: Joi.date().iso()
    }),
    location: Joi.string(),
    image: Joi.string().optional(),
    tickets: Joi.array().items(ticketSchema).min(1),
});

export type CSEventWithTickets = ICSEvent & {
    tickets: { name: string, total: number, price: number }[]
}

