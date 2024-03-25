import * as amqp from 'amqplib';
import dotenv from 'dotenv';
import { COMMENT_EXCHANGE, COMMENT_QUEUE, TICKET_INFO_EXCHANGE, TICKET_INFO_QUEUE } from './const.js';
import { plusCommentCount, updateCheapesstTicket } from './db.js';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

export const consumeMessages = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);

        const channel = await connection.createChannel();

        await channel.assertExchange(COMMENT_EXCHANGE, 'fanout', { durable: false });
        await channel.assertExchange(TICKET_INFO_EXCHANGE, 'fanout', { durable: false });

        await channel.assertQueue(COMMENT_QUEUE, { durable: false });
        await channel.assertQueue(TICKET_INFO_QUEUE, { durable: false });

        await channel.bindQueue(COMMENT_QUEUE, COMMENT_EXCHANGE, '');
        await channel.bindQueue(TICKET_INFO_QUEUE, TICKET_INFO_EXCHANGE, '');

        await channel.consume(COMMENT_QUEUE, async (msg) => {
            const eventId = msg.content.toString();
            console.log(`Comsumer >>> received message: ${eventId} for comments`);
            await plusCommentCount(eventId);
            channel.ack(msg);
        });

        await channel.consume(TICKET_INFO_QUEUE, async (msg) => {
            console.log("TICKET_INFO_QUEUE");
            // TODO - handle null (meaning no ticket available for the event)
            const cheapest_ticket = JSON.parse(msg.content.toString());
            console.log(`Comsumer >>> received message: ${cheapest_ticket.eventId} for ticket info`);
            await updateCheapesstTicket(cheapest_ticket.eventId, cheapest_ticket.name, cheapest_ticket.price);
            channel.ack(msg);
        });

    } catch (error) {
        console.error(error);
    }
};