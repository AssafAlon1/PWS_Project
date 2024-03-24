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
  tickets: {
    type: [{
      _id: false,
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }], required: true
  },
  comment_count: { type: Number, required: false, default: 0 },
  image: { type: String, required: false },
}, { versionKey: false });

const ticketSchema = Joi.object({
  name: Joi.string().required(),
  quantity: Joi.number().integer().min(0).required(),
  price: Joi.number().min(0).required(),
});

export const eventSchema = Joi.object({
  title: Joi.string(),
  category: Joi.string().valid(...VALID_CATEGORIES),
  description: Joi.string(),
  organizer: Joi.string(),
  start_date: Joi.date().iso(),  // By Piazza @83, any valid ISO is good for us.
  end_date: Joi.date().iso().when('start_date', { // This means validations will only run if both start_date and end_date are present.
    is: Joi.exist(),
    then: Joi.date().iso().greater(Joi.ref('start_date')),
    otherwise: Joi.date().iso()
  }),
  location: Joi.string(),
  tickets: Joi.array().items(ticketSchema).min(1),
  comment_count: Joi.number().integer().min(0).optional(),
  image: Joi.string().optional(),
});

export type ICSEvent = InferSchemaType<typeof mongooseEventSchema>;

export default mongoose.model("CSEvent", mongooseEventSchema, "events");
