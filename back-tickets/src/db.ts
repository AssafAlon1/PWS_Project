import CSTicket, { ICSTicket } from "./models/CSTicket.js";
import { StatusCodes } from 'http-status-codes';

export const insertTicket = async (ticketData: ICSTicket): Promise<string | number> => {
  const newTicket = new CSTicket(ticketData);
  try {
    await newTicket.validate();
  }
  catch (err) {
    return StatusCodes.BAD_REQUEST;
  }

  try {
    await newTicket.save();
    return newTicket._id.toString();
  }
  catch (err) {
    return StatusCodes.INTERNAL_SERVER_ERROR;
  }
}

export const updateTicket = async (ticketData: ICSTicket): Promise<number> => {
  console.log("updateTicket for ticketData: ", ticketData);
  try {
    await CSTicket.updateOne({ _id: ticketData._id }, ticketData).exec();
    console.log("Updated ticket");
    return StatusCodes.OK;
  }
  catch (err) {
    return StatusCodes.INTERNAL_SERVER_ERROR;
  }
}

export const queryAllTicketsByEventID = async (eventId: string, skip: number, limit: number): Promise<ICSTicket[]> => {
  console.log("queryAllTicketsByEventID for eventId: ", eventId);
  const tickets = await CSTicket.find({ eventId: eventId }).skip(skip).limit(limit).exec();
  console.log("Got tickets: ", tickets);
  return tickets.map(ticket => ticket.toJSON() as ICSTicket);
}

export const queryAvailableTicketsByEventID = async (eventId: string, skip: number, limit: number): Promise<ICSTicket[]> => {
  console.log("queryAvailableTicketsByEventID for eventId: ", eventId);
  const tickets = await CSTicket.find({ eventId: eventId, quantity: { $gt: 0 } }).skip(skip).limit(limit).exec();
  console.log("Got tickets: ", tickets);
  return tickets.map(ticket => ticket.toJSON() as ICSTicket);
}

export const queryTicketByName = async (eventId: string, ticketName: string): Promise<ICSTicket | null> => {
  console.log("queryTicketByName for eventId: ", eventId, " and ticketName: ", ticketName);
  const ticket = await CSTicket.findOne({ eventId: eventId, name: ticketName }).exec();
  console.log("Got ticket: ", ticket);
  return ticket ? ticket.toJSON() as ICSTicket : null;
}

export const queryCheapestTicketsByEventID = async (eventId: string): Promise<ICSTicket | null> => {
  console.log("queryCheapestTicketsByEventID for eventId: ", eventId);
  const ticket = await CSTicket.find({ eventId: eventId, quantity: { $gt: 0 } }).sort({ price: 1 }).limit(1).exec();
  console.log("Got tickets: ", ticket);
  return ticket.length > 0 ? ticket[0].toJSON() as ICSTicket : null;
}