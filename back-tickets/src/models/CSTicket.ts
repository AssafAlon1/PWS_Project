import mongoose, { InferSchemaType, Types } from "mongoose";
import Joi from "joi";

const mongooseTicketSchema = new mongoose.Schema({
    _id: { type: Types.ObjectId, required: false, auto: true },
    event_id: { type: Types.ObjectId, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
});

export const ticketSchema = Joi.object({
    name: Joi.string().required(),
    quantity: Joi.number().integer().min(0).required(),
    price: Joi.number().min(0).required(),
  });

export type ICSTicket = InferSchemaType<typeof mongooseTicketSchema>;

export default mongoose.model("CSTicket", mongooseTicketSchema, "tickets");