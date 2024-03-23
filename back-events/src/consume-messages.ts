import * as amqp from 'amqplib';
import dotenv from 'dotenv';
import { COMMENT_EXCHANGE, COMMENT_QUEUE } from './const.js';
import { plusCommentCount } from './db.js';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

export const consumeMessages = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);

        const channel = await connection.createChannel();

        await channel.assertExchange(COMMENT_EXCHANGE, 'fanout', { durable: false });

        await channel.assertQueue(COMMENT_QUEUE, { durable: false });

        await channel.bindQueue(COMMENT_QUEUE, COMMENT_EXCHANGE, '');

        await channel.consume(COMMENT_QUEUE, async (msg) => {
            const eventId = msg.content.toString();
            console.log(`Comsumer >>> received message: ${eventId}`);
            await plusCommentCount(eventId);
            channel.ack(msg);
        });
    } catch (error) {
        console.error(error);
    }
};