import mongoose, { InferSchemaType, Types } from "mongoose";
import Joi from "joi";

const mongooseUserActionSchema = new mongoose.Schema({
    _id: { type: Types.ObjectId, required: false, auto: true },
    username: { type: String, required: true },
    event_id: { type: String, required: true },
    ticket_name: { type: String, required: true },
    ticket_amount: { type: Number, required: true },
    price: { type: Number, required: true },
    purchase_id: { type: String, required: true },
    purchase_time: { type: Date, required: true },
    refund_time: { type: Date, required: false },
});

export const userActionSchema = Joi.object({
    username: Joi.string().required(),
    event_id: Joi.string().required(),
    ticket_name: Joi.string().required(),
    ticket_amount: Joi.number().integer().min(1).required(),
    price: Joi.number().min(0).required(),
    purchase_id: Joi.string().required(),
    purchase_time: Joi.date().iso().required(),
    refund_time: Joi.date().iso().when('purchase_time', {
        is: Joi.exist(),
        then: Joi.date().iso().greater(Joi.ref('purchase_time')),
        otherwise: Joi.date().iso()
    }),
});

export type IUserAction = InferSchemaType<typeof mongooseUserActionSchema>;

export default mongoose.model("UserAction", mongooseUserActionSchema, "actions");
