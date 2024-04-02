import CSTicket, { ICSTicket } from "./models/CSTicket.js";
import { StatusCodes } from 'http-status-codes';
import { startSession } from 'mongoose';

const LOCK_TIME_MINUTES = 2;

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
    // TODO - maybe use this instead of the for loop
    // await Promise.all(ticketData.map(async (ticket) => {
    //   const newTicket = new CSTicket(ticket);
    //   await newTicket.validate();
    //   await newTicket.save();
    // }));

    await session.commitTransaction();
    return StatusCodes.CREATED;
  }
  catch (err) {
    console.error("Failed to insert tickets in transaction");
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

export const lockTickets = async (event_id: string, ticketName: string, quantity: number, username: string): Promise<number> => {
  let session;
  try {
    session = await startSession();
    session.startTransaction();

    const ticket = await queryTicketByName(event_id, ticketName);
    if (ticket === null) {
      console.error("Ticket not found for event_id: ", event_id, " ticket_name: ", ticketName);
      return StatusCodes.NOT_FOUND;
    }

    if (!ticket.available || typeof ticket.available != "number" || ticket.available < quantity) {
      console.error("Not enough tickets available for ticket with id: ", ticket._id);
      return StatusCodes.BAD_REQUEST;
    }

    // Remove the tickets from the available amount
    await CSTicket.updateOne(
      { _id: ticket._id, available: { $gte: quantity } },
      { $inc: { available: -quantity } }
    ).exec();

    // Add the tickets to the locked array
    const lockedExpires = new Date();
    await CSTicket.updateOne(
      { _id: ticket._id },
      {
        $push: {
          locked: {
            quantity: quantity,
            expires: lockedExpires.setMinutes(lockedExpires.getMinutes() + LOCK_TIME_MINUTES),
            username: username
          }
        }
      }
    ).exec();

    await session.commitTransaction();
    console.log("[OK] Locked tickets for event_id: ", event_id, " ticket_name: ", ticketName, " ticket_amount: ", quantity)
    return StatusCodes.OK;
  }
  catch (err) {
    console.error("Failed to lock tickets for event_id: ", event_id, " ticket_name: ", ticketName, " ticket_amount: ", quantity);
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
