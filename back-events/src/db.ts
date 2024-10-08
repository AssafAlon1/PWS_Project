import { isValidObjectId } from "mongoose";
import CSEvent, { ICSEvent } from "./models/CSEvent.js";
import { StatusCodes } from 'http-status-codes';

export const insertEvent = async (eventData: ICSEvent): Promise<string | number> => {
  const newEvent = new CSEvent(eventData);
  try {
    await newEvent.validate();
  }
  catch (err) {
    return StatusCodes.BAD_REQUEST;
  }

  try {
    await newEvent.save();
    return newEvent._id.toString();
  }
  catch (err) {
    return StatusCodes.INTERNAL_SERVER_ERROR;
  }
}

export const queryEventByID = async (id: string): Promise<ICSEvent | null> => {
  const event = await CSEvent.findById(id).exec();
  return event ? event.toJSON() as ICSEvent : null;
}

export const queryUpcomingAvailableEvents = async (skip: number, limit: number): Promise<ICSEvent[]> => {
  const currentDate = new Date();
  const events = await CSEvent.find({ start_date: { $gt: currentDate }, total_available_tickets: { $gt: 0 } }).skip(skip).limit(limit).exec();
  return events.map(event => event.toJSON() as ICSEvent);
}

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

export const plusCommentCount = async (eventId: string): Promise<void> => {
  await CSEvent.findByIdAndUpdate(eventId, { $inc: { comment_count: 1 } }).exec();
}

export const updateCheapesstTicket = async (eventId: string, ticketName: string, price: number): Promise<void> => {
  await CSEvent.findByIdAndUpdate(eventId, { cheapest_ticket_name: ticketName, cheapest_ticket_price: price }).exec();
}

export const queryClosestEvent = async (eventIds: string[]): Promise<ICSEvent | null> => {
  const currentDate = new Date();
  eventIds = eventIds.filter(id => isValidObjectId(id));
  const events = await CSEvent.find({ _id: { $in: eventIds }, start_date: { $gt: currentDate } }).sort({ start_date: 1 }).limit(1).exec();
  return events.length > 0 ? events[0].toJSON() as ICSEvent : null;
}

export const updateAvailableTickets = async (eventId: string, ticketAmount: number): Promise<void> => {
  await CSEvent.findByIdAndUpdate(eventId, { $inc: { total_available_tickets: ticketAmount } }).exec();
}