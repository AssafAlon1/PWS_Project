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