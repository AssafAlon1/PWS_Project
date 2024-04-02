import mongoose, { InferSchemaType, Types } from "mongoose";
import Joi from "joi";


const CommentSchema = new mongoose.Schema({
  eventId: { type: String, required: true },
  author: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, required: true }
}
);

export const commentSchema = Joi.object({
  eventId: Joi.string().required(),
  author: Joi.string().required(),
  content: Joi.string().required(),
  createdAt: Joi.date().iso(),
}).unknown(true);

export type ICSComment = InferSchemaType<typeof CommentSchema>;

export default mongoose.model("Comment", CommentSchema);
