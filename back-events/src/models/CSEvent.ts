import mongoose, { InferSchemaType, Types } from "mongoose";
import Joi from "joi";
import { VALID_CATEGORIES } from "../const.js";

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
  cheapest_ticket_name: { type: String, required: false },     // for enabling quick access to the cheapest ticket
  cheapest_ticket_price: { type: Number, required: true },     // for catalog page 
  total_available_tickets: { type: Number, required: true },   // for catalog page
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
  cheapest_ticket_name: Joi.string().optional(),
  cheapest_ticket_price: Joi.number().min(0),
  total_available_tickets: Joi.number(),
  image: Joi.string().optional(),
});

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

export const updateEventSchema = Joi.object({
  _id: Joi.object().forbidden(),
  title: Joi.string().forbidden(),
  comment_count: Joi.number().forbidden(),
  cheapest_ticket_name: Joi.string().forbidden(),
  cheapest_ticket_price: Joi.number().forbidden(),
  total_available_tickets: Joi.number().forbidden(),
  description: Joi.string().forbidden(),
  location: Joi.string().forbidden(),
  image_url: Joi.string().forbidden(),
  category: Joi.string().forbidden(),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().when('start_date', {
    is: Joi.exist(),
    then: Joi.date().iso().greater(Joi.ref('start_date')),
    otherwise: Joi.date().iso()
  }),
});

export type ICSEvent = InferSchemaType<typeof mongooseEventSchema>;

export default mongoose.model("CSEvent", mongooseEventSchema, "events");
