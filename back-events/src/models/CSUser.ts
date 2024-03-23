import mongoose, { InferSchemaType, Types } from "mongoose";
import Joi from "joi";
import { UserRole } from "../types.js";

const UserSchema = new mongoose.Schema({
  _id: { type: Types.ObjectId, required: false, auto: true }, // Will be auto-generated
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: Number, required: true },
});

export const userSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  role: Joi.number().default(UserRole["Worker"]).valid(...Object.values(UserRole)),
}).unknown(true);

export type ICSUser = InferSchemaType<typeof UserSchema>;

export default mongoose.model("CSUser", UserSchema, "users");
