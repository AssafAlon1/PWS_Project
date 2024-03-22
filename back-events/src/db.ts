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

export const registerUser = async (username: string, hashedPassword: string): Promise<HTTPError | true> => {
  const user = new CSUser({ username: username, password: hashedPassword, role: DEFAULT_ROLE });
  try {
    await user.validate();
  }
  catch (err) {
    return HTTPError["ERROR_400"];
  }
  try {
    await user.save();
    return true;
  }
  catch (err) {
    return HTTPError["ERROR_500"];
  }
}

export const doesUserExist = async (username: string): Promise<boolean> => {
  try {
    const user = await CSUser.findOne({ username: username }).exec();
    return user !== null;
  }
  catch (err) {
    return false;
  }
}

export const updateUserPermission = async (username: string, newPermissions: string): Promise<boolean> => {
  if (newPermissions !== "W" && newPermissions !== "M") {
    return false;
  }

  try {
    const user = await CSUser.findOne({ username: username }).exec();
    if (!user) {
      return false;
    }
    user.role = UserRole[newPermissions === "W" ? "Worker" : "Manager"];
    await user.save();
  }
  catch (err) {
    return false;
  }
  return true;
}

export const queryUserByCredentials = async (username: string, password: string): Promise<ICSUser | null> => {
  try {
    const user = await CSUser.findOne({ username: username }).exec();
    // bcrypt.hash create single string with all the informatin of the password hash and salt.
    // Read more here: https://en.wikipedia.org/wiki/Bcrypt
    // Compare password hash & salt.
    if (!user || !await bcrypt.compare(password, user.password)) {
      return null;
    }
    return user.toJSON() as ICSUser;
  }
  catch (err) {
    return null;
  }
}

export const queryUserRoleById = async (userId: string): Promise<UserRole> => {
  let user: ICSUser;
  try {
    user = await CSUser.findById(userId).exec();
  }
  catch (error) {
    return UserRole["Worker"]; // return the lowest permission possible
  }
  return user.role;
}

export const queryUserRoleByUsername = async (username: string): Promise<UserRole> => {
  let user: ICSUser;
  try {
    user = await CSUser.findOne({username: username}).exec();
  }
  catch (error) {
    return UserRole["Worker"]; // return the lowest permission possible
  }
  return user.role;
}

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

export const queryEventsByCategory = async (category: string, skip: number, limit: number): Promise<ICSEvent[]> => {
  const events = await CSEvent.find({ category: category }).skip(skip).limit(limit).exec();
  return events.map(event => event.toJSON() as ICSEvent);
}

export const queryEventsByOrganizer = async (organizer: string, skip: number, limit: number): Promise<ICSEvent[]> => {
  const events = await CSEvent.find({ organizer: organizer }).skip(skip).limit(limit).exec();
  return events.map(event => event.toJSON() as ICSEvent);
}

export const deleteEventByID = async (id: string): Promise<void> => {
  await CSEvent.findByIdAndDelete(id).exec();
}

export const updateEventByID = async (eventId: string, event: ICSEvent): Promise<void> => {
  await CSEvent.findByIdAndUpdate(eventId, event).exec();
}