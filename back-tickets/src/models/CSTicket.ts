import mongoose, { InferSchemaType, Types } from "mongoose";
import Joi from "joi";

const mongooseLockSchema = new mongoose.Schema({
    username: { type: String, required: true },
    quantity: { type: Number, required: true },
    expires: { type: Date, required: true },
});

export const lockSchema = Joi.object({
    username: Joi.string().required(),
    quantity: Joi.number().integer().min(0).required(),
    expires: Joi.date().required(),
});

export const lockRequestSchema = Joi.object({
    username: Joi.string().required(),
    quantity: Joi.number().integer().min(0).required(),
    eventId: Joi.string().required(),
    ticketName: Joi.string().required(),
});

const mongooseTicketSchema = new mongoose.Schema({
    _id: { type: Types.ObjectId, required: false, auto: true },
    eventId: { type: String, required: true },
    name: { type: String, required: true },
    available: { type: Number, required: true },
    total: { type: Number, required: true },
    price: { type: Number, required: true },
    locked: { type: [mongooseLockSchema], required: true, default: []}, // TODO - is dis oki?
});

export const ticketSchema = Joi.object({
    eventId: Joi.string().required(),
    name: Joi.string().required(),
    available: Joi.number().integer().min(0),
    total: Joi.number().integer().min(0).required(),
    price: Joi.number().min(0).required(),
    locked: Joi.array().items(lockSchema).default([]),
});

export type ICSTicket = InferSchemaType<typeof mongooseTicketSchema>;

export default mongoose.model("CSTicket", mongooseTicketSchema, "tickets");
