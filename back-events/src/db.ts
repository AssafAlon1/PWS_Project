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

// TODO - queryUpcomingAvailableEvents ??
export const queryUpcomingEvents = async (skip: number, limit: number): Promise<ICSEvent[]> => {
  const currentDate = new Date();
  const events = await CSEvent.find({ start_date: { $gt: currentDate } }).skip(skip).limit(limit).exec();
  return events.map(event => event.toJSON() as ICSEvent);
}

export const deleteEventByID = async (id: string): Promise<void> => {
  await CSEvent.findByIdAndDelete(id).exec();
}

export const updateEventByID = async (eventId: string, event: ICSEvent): Promise<void> => {
  await CSEvent.findByIdAndUpdate(eventId, event).exec();
}