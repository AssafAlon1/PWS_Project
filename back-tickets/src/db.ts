import CSTicket, { ICSTicket } from "./models/CSTicket.js";
import { StatusCodes } from 'http-status-codes';
import { startSession } from 'mongoose';

// Adds all tickets in one transaction
export const insertTickets = async (ticketData: ICSTicket[]): Promise<number> => {
  let session;
  try {
    session = await startSession();
    session.startTransaction();

    for (const ticket of ticketData) {
      const newTicket = new CSTicket(ticket);
      await newTicket.validate();
      await newTicket.save();
    }

    await session.commitTransaction();
    return StatusCodes.CREATED;
  }
  catch (err) {
    console.log("ERROR?!")
    if (session) {
      await session.abortTransaction();
    }
    return StatusCodes.INTERNAL_SERVER_ERROR;
  }
  finally {
    if (session) {
      session.endSession();
    }
  }
}

// TODO - legacy - maybe remove
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

// TODO - legacy - maybe remove
export const updateTicket = async (ticketData: ICSTicket): Promise<number> => {
  try {
    await CSTicket.updateOne({ _id: ticketData._id }, ticketData).exec();
    return StatusCodes.OK;
  }
  catch (err) {
    return StatusCodes.INTERNAL_SERVER_ERROR;
  }
}

// Will be used for buying and refunding tickets
export const updateTicketAmount = async (ticketId: string, increaseAmount: number): Promise<number> => {
  try {
    // This is done atomically (check amount and update if enough tickets are available)
    const result = await CSTicket.updateOne(
      { _id: ticketId, available: { $gte: -increaseAmount } },
      { $inc: { available: increaseAmount } }
    ).exec();

    if (result.modifiedCount === 0) {
      console.error("Not enough tickets available for ticket with id: ", ticketId);
      return StatusCodes.BAD_REQUEST;
    }

    return StatusCodes.OK;
  }
  catch (err) {
    console.error("Failed to update ticket amount for ticket with id: ", ticketId + " and purchaseAmount: ", increaseAmount);
    return StatusCodes.INTERNAL_SERVER_ERROR;
  }
}

export const queryAllTicketsByEventID = async (eventId: string, skip: number, limit: number): Promise<ICSTicket[]> => {
  const tickets = await CSTicket.find({ eventId: eventId }).skip(skip).limit(limit).exec();
  return tickets.map(ticket => ticket.toJSON() as ICSTicket);
}

export const queryAvailableTicketsByEventID = async (eventId: string, skip: number, limit: number): Promise<ICSTicket[]> => {
  const tickets = await CSTicket.find({ eventId: eventId, available: { $gt: 0 } }).skip(skip).limit(limit).exec();
  return tickets.map(ticket => ticket.toJSON() as ICSTicket);
}

export const queryTicketByName = async (eventId: string, ticketName: string): Promise<ICSTicket | null> => {
  const ticket = await CSTicket.findOne({ eventId: eventId, name: ticketName }).exec();
  return ticket ? ticket.toJSON() as ICSTicket : null;
}

export const queryCheapestTicketsByEventID = async (eventId: string): Promise<ICSTicket | null> => {
  const ticket = await CSTicket.find({ eventId: eventId, available: { $gt: 0 } }).sort({ price: 1 }).limit(1).exec();
  return ticket.length > 0 ? ticket[0].toJSON() as ICSTicket : null;
}

export const updateRefund = async (event_id: string, ticket_name: string, amount: number): Promise<number> => {
  const ticket = await queryTicketByName(event_id, ticket_name);
  if (ticket === null) {
    // TODO - better handeling
    console.error("Ticket not found for event_id: ", event_id, " ticket_name: ", ticket_name);
    return StatusCodes.NOT_FOUND;
  }
  return await updateTicketAmount(ticket._id.toString(), amount);
}