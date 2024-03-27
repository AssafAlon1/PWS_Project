import * as amqp from 'amqplib';
import dotenv from 'dotenv';
import { BUY_TICKETS_EXCHANGE, BUY_TICKETS_QUEUE, COMMENT_EXCHANGE, COMMENT_QUEUE, REFUND_TICKETS_EXCHANGE, REFUND_TICKETS_QUEUE, TICKET_INFO_EXCHANGE, TICKET_INFO_QUEUE } from './const.js';
import { plusCommentCount, updateAvailableTickets, updateCheapesstTicket } from './db.js';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

export const consumeMessages = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);

        const channel = await connection.createChannel();

        await channel.assertExchange(COMMENT_EXCHANGE, 'fanout', { durable: false });
        await channel.assertExchange(TICKET_INFO_EXCHANGE, 'fanout', { durable: false });
        await channel.assertExchange(BUY_TICKETS_EXCHANGE, 'fanout', { durable: false });
        await channel.assertExchange(REFUND_TICKETS_EXCHANGE, 'fanout', { durable: false });

        await channel.assertQueue(COMMENT_QUEUE, { durable: false });
        await channel.assertQueue(TICKET_INFO_QUEUE, { durable: false });
        await channel.assertQueue(BUY_TICKETS_QUEUE, { durable: false });
        await channel.assertQueue(REFUND_TICKETS_QUEUE, { durable: false });

        await channel.bindQueue(COMMENT_QUEUE, COMMENT_EXCHANGE, '');
        await channel.bindQueue(TICKET_INFO_QUEUE, TICKET_INFO_EXCHANGE, '');
        await channel.bindQueue(BUY_TICKETS_QUEUE, BUY_TICKETS_EXCHANGE, '');
        await channel.bindQueue(REFUND_TICKETS_QUEUE, REFUND_TICKETS_EXCHANGE, '');

        await channel.consume(COMMENT_QUEUE, async (msg) => {
            const eventId = msg.content.toString();
            console.log(`Comsumer >>> received message: ${ eventId } for comments`);
            await plusCommentCount(eventId);
            channel.ack(msg);
        });

        await channel.consume(TICKET_INFO_QUEUE, async (msg) => {
            console.log("TICKET_INFO_QUEUE");
            // TODO - handle null (meaning no ticket available for the event)
            const cheapest_ticket = JSON.parse(msg.content.toString());
            console.log(`Comsumer >>> received message: ${ cheapest_ticket.eventId } for ticket info`);
            await updateCheapesstTicket(cheapest_ticket.eventId, cheapest_ticket.name, cheapest_ticket.price);
            channel.ack(msg);
        });

        await channel.consume(BUY_TICKETS_QUEUE, async (msg) => {
            console.log("BUY_TICKETS_QUEUE");
            const order_data = JSON.parse(msg.content.toString());
            console.log(`Comsumer >>> received message: ${ order_data.purchase_id } for buying tickets`);
            // TODO - update ticket count
            await updateAvailableTickets(order_data.event_id, -order_data.ticket_amount);
            channel.ack(msg);
        });

        await channel.consume(REFUND_TICKETS_QUEUE, async (msg) => {
            console.log("REFUND_TICKETS_QUEUE");
            const refund_data = JSON.parse(msg.content.toString());
            console.log(`Comsumer >>> received message for refunding tickets for event ${refund_data.event_id}`);
            // TODO - update ticket count
            await updateAvailableTickets(refund_data.event_id, refund_data.ticket_amount);
            channel.ack(msg);
        });

    } catch (error) {
        console.error(error);
    }
};