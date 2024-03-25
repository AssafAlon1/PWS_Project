import * as amqp from 'amqplib';
import dotenv from 'dotenv';
import { COMMENT_EXCHANGE, COMMENT_QUEUE, TICKET_INFO_EXCHANGE, TICKET_INFO_QUEUE } from './const.js';
import { plusCommentCount } from './db.js';

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
            const eventId = msg.content.toString();
            console.log(`Comsumer >>> received message: ${eventId} for ticket info`);
            // await plusCommentCount(eventId);
            // TODO - implement the logic to update ticket info (msg is the cheapest ticket)
            channel.ack(msg);
        });

    } catch (error) {
        console.error(error);
    }
};