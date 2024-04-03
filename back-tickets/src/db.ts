import CSTicket, { ICSTicket } from "./models/CSTicket.js";
import { StatusCodes } from 'http-status-codes';
import { startSession } from 'mongoose';
import { LOCK_TIME_SECONDS, LOCK_GRACE_PERIOD_SECONDS } from "./const.js";

const clearExpiredLocks = async (ticketId: string) => {
  const currentDate = new Date(new Date().getTime() - 2 * LOCK_GRACE_PERIOD_SECONDS * 1000);

  let session;
  try {
    session = await startSession();
    session.startTransaction();

    // Remove all the expired locks
    const oiginalTicket = await CSTicket.findOneAndUpdate(
      { _id: ticketId },
      {
        $pull: {
          locked: {
            expires: { $lte: currentDate }
          }
        }
      }
    ).exec();
    
    // Re-add the locked tickets to the available amount
    let count = 0;
    oiginalTicket.locked.forEach(lock => {
      if(lock.expires < currentDate) {
        count += lock.quantity;
      }
    });

    await CSTicket.findOneAndUpdate(
      { _id: ticketId },
      {
        $inc: { available: count }
      }
    ).exec();

    await session.commitTransaction();
    if (count) {
      console.log(" > Cleared ", count, " tickets held by expired locks with id: ", ticketId);
    }
  }
  catch (err) {
    console.error("Failed to clear expired locks for ticket with id: ", ticketId);
  }
}

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
    console.error("Failed to update ticket amount for ticket with id: ", ticketId + " and increaseAmount: ", increaseAmount);
    return StatusCodes.INTERNAL_SERVER_ERROR;
  }
}

export const queryAllTicketsByEventID = async (eventId: string, skip: number, limit: number): Promise<ICSTicket[]> => {
  let tickets = await CSTicket.find({ eventId: eventId }).skip(skip).limit(limit).exec();
  await Promise.all(tickets.map(async ticket => await clearExpiredLocks(ticket._id.toString())));
  tickets = await CSTicket.find({ eventId: eventId }).skip(skip).limit(limit).exec(); // Painful, but needed to get the updated data
  return tickets.map(ticket => ticket.toJSON() as ICSTicket);
}

// TODO - legacy - maybe remove
// // export const queryAvailableTicketsByEventID = async (eventId: string, skip: number, limit: number): Promise<ICSTicket[]> => {
// //   const tickets = await CSTicket.find({ eventId: eventId, available: { $gt: 0 } }).skip(skip).limit(limit).exec();
// //   return tickets.map(ticket => ticket.toJSON() as ICSTicket);
// // }

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

export const lockTickets = async (event_id: string, ticketName: string, quantity: number, username: string, expires?: Date): Promise<number> => {
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
    const lockedExpires = expires ? expires : new Date();
    await CSTicket.updateOne(
      { _id: ticket._id },
      {
        $push: {
          locked: {
            quantity: quantity,
            expires: lockedExpires.setSeconds(lockedExpires.getSeconds() + LOCK_TIME_SECONDS),
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

export const removeTicketLock = async (ticketId: string, username: string, quantity: number, expires: Date): Promise<number> => {
  try {
    await CSTicket.updateOne(
      { _id: ticketId },
      {
        $pull: {
          locked: {
            quantity: quantity,
            expires: expires,
            username: username
          }
        }
      }
    ).exec();
  }
  catch (err) {
    console.error("Failed to remove ticket locks for ticket with id: ", ticketId);
    return StatusCodes.INTERNAL_SERVER_ERROR;
  }
  return StatusCodes.OK;
}

export const addTicketLock = async (ticketId: string, username: string, quantity: number, expires: Date): Promise<number> => {
  try {
    await CSTicket.updateOne(
      { _id: ticketId },
      {
        $push: {
          locked: {
            quantity: quantity,
            expires: expires,
            username: username
          }
        }
      }
    ).exec();
  }
  catch (err) {
    console.error("Failed to add ticket locks for ticket with id: ", ticketId);
    return StatusCodes.INTERNAL_SERVER_ERROR;
  }
  return StatusCodes.OK;
}

export const isSoldOut = async (ticketId: string): Promise<boolean> => {
  const ticket = await CSTicket.findOne({ _id: ticketId, available: { $gt: 0 }}).exec();
  return !ticket;
}