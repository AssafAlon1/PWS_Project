import CSTicket, { ICSTicket } from "./models/CSTicket.js";
import { StatusCodes } from 'http-status-codes';
import { startSession } from 'mongoose';
import { LOCK_TIME_SECONDS, LOCK_GRACE_PERIOD_SECONDS } from "./const.js";

const clearExpiredLock = async (ticketId: string, username: string, quantity: number, expires: Date) => {
  // const currentDate = new Date(new Date().getTime() - 2 * LOCK_GRACE_PERIOD_SECONDS * 1000);
  let session;
  try {
    session = await startSession();
    session.startTransaction();

    // Remove the specified expired lock
    const result = await CSTicket.updateOne(
      { _id: ticketId },
      {
        $pull: {
          locked: {
            username: username,
            quantity: quantity,
            expires: expires
          }
        }
      }
    ).exec();
    
    // Re-add the locked tickets to the available amount - only if they weren't bought
    if(result.modifiedCount === 1) {
      await CSTicket.updateOne(
        { _id: ticketId },
        {
          $inc: { available: quantity }
        }
      ).exec();
    }
    else {
      console.error("lock for ticket id:", ticketId, " with username: ", username, " was already removed");
    }

    await session.commitTransaction();

    // TODO - remove? (what if one of the transactions failed?)
    if (result.modifiedCount === 1) { 
      console.log(" >> Cleared ", quantity, " tickets held by expired locks with id: ", ticketId);
    }
  }
  catch (err) {
    console.error("Failed to clear expired lock for ticket with id: ", ticketId, " for user: ", username);
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

// Will be used for refunding tickets (used to serve purchase as well, but now it's done from lock)
export const updateTicketAmount = async (ticketId: string, increaseAmount: number): Promise<number> => {
  try {
    // This is done atomically (check amount and update if enough tickets are available)
    const result = await CSTicket.updateOne(
      { _id: ticketId },
      { $inc: { available: increaseAmount } }
    ).exec();

    if (result.modifiedCount === 0) {
      console.error("No such ticket id: ", ticketId);
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
  const tickets = await CSTicket.find({ eventId: eventId }).skip(skip).limit(limit).exec();
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
    const expirationTime = new Date(lockedExpires.getTime() + LOCK_TIME_SECONDS * 1000); // TODO - is dis oki?
    await CSTicket.updateOne(
      { _id: ticket._id },
      {
        $push: {
          locked: {
            quantity: quantity,
            // expires: lockedExpires.setSeconds(lockedExpires.getSeconds() + LOCK_TIME_SECONDS),
            expires: expirationTime,
            username: username
          }
        }
      }
    ).exec();

    await session.commitTransaction();

    // after commiting the transaction, set timeout to clear the lock
    const currentTime = new Date();
    // Calculate the time remaining on the lock since it was set in milliseconds
    const durationUntilExpiration = expirationTime.getTime() - currentTime.getTime();
    setTimeout(() => {
      clearExpiredLock(ticket._id.toString(), username, quantity, expirationTime).catch(console.error);
    }, durationUntilExpiration + 2 * LOCK_GRACE_PERIOD_SECONDS * 1000); // some grace before removing the lock


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
  console.log("[OK] Removed lock manually for ticket with id: ", ticketId, " because it was bought.");
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
