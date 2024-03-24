import mongoose, { InferSchemaType, Types } from "mongoose";
import Joi from "joi";

// TODO - add available tickets, switch quantity for total tickets
// TODO - add locked array
const mongooseTicketSchema = new mongoose.Schema({
    _id: { type: Types.ObjectId, required: false, auto: true },
    eventId: { type: String, required: true },
    name: { type: String, required: true },
    available: { type: Number, required: false },
    total: { type: Number, required: true },
    price: { type: Number, required: true }
});

export const ticketSchema = Joi.object({
    eventId: Joi.string().required(),
    name: Joi.string().required(),
    available: Joi.number().integer().min(0),
    total: Joi.number().integer().min(0).required(),
    price: Joi.number().min(0).required(),
  });

export type ICSTicket = InferSchemaType<typeof mongooseTicketSchema>;

export default mongoose.model("CSTicket", mongooseTicketSchema, "tickets");