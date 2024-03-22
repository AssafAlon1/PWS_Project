import mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { DEFAULT_ROLE } from "./const.js";
import CSEvent, { ICSEvent } from "./models/CSEvent.js";
import CSUser, { ICSUser } from "./models/CSUser.js";
import { HTTPError, UserRole } from "./types.js";

dotenv.config();
const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING;

mongoose.set('strictQuery', true);

mongoose.connect(DB_CONNECTION_STRING);

export const insertEvent = async (eventData: ICSEvent): Promise<HTTPError | string> => {
  const newEvent = new CSEvent(eventData);
  try {
    await newEvent.validate();
  }
  catch (err) {
    return HTTPError["ERROR_400"];
  }

  try {
    await newEvent.save();
    return newEvent._id.toString();
  }
  catch (err) {
    return HTTPError["ERROR_500"];
  }
}

export const queryEventByID = async (id: string): Promise<ICSEvent | null> => {
  const event = await CSEvent.findById(id).exec();
  return event ? event.toJSON() as ICSEvent : null;
}

export const deleteEventByID = async (id: string): Promise<void> => {
  await CSEvent.findByIdAndDelete(id).exec();
}

export const updateEventByID = async (eventId: string, event: ICSEvent): Promise<void> => {
  await CSEvent.findByIdAndUpdate(eventId, event).exec();
}