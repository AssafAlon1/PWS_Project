import mongoose, { InferSchemaType, Types } from "mongoose";
import Joi from "joi";
import { VALID_CATEGORIES } from "../const.js";

// TODO - add cheapest ticket num, cheapest price, totalAvaliableTickets
// TODO - remove ticket array
const mongooseEventSchema = new mongoose.Schema({
  _id: { type: Types.ObjectId, required: false, auto: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  organizer: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  location: { type: String, required: true },
  comment_count: { type: Number, required: false, default: 0 },
  cheapest_ticket_id: { type: String, required: false },        // for enabling quick access to the cheapest ticket
  cheapest_ticket_price: { type: Number, required: false },     // for catalog page 
  cheapest_ticket_num: { type: Number, required: false },       // maybe redundent since ticket microservice will provide events the cheapest ticket every time a ticket runs out
  total_available_tickets: { type: Number, required: false },   // for catalog page
  image: { type: String, required: false },
}, { versionKey: false });

export const eventSchema = Joi.object({
  title: Joi.string(),
  category: Joi.string().valid(...VALID_CATEGORIES),
  description: Joi.string(),
  organizer: Joi.string(),
  start_date: Joi.date().iso(),  
  end_date: Joi.date().iso().when('start_date', { // This means validations will only run if both start_date and end_date are present.
    is: Joi.exist(),
    then: Joi.date().iso().greater(Joi.ref('start_date')),
    otherwise: Joi.date().iso()
  }),
  location: Joi.string(),
  comment_count: Joi.number().integer().min(0).optional(),
  cheapest_ticket_id: Joi.string().optional(),
  cheapest_ticket_price: Joi.number().min(0).optional(),
  cheapest_ticket_num: Joi.number().min(0).optional(),
  total_available_tickets: Joi.number().optional(),
  image: Joi.string().optional(),
});

export type ICSEvent = InferSchemaType<typeof mongooseEventSchema>;

export default mongoose.model("CSEvent", mongooseEventSchema, "events");
