import * as amqp from 'amqplib';
import dotenv from 'dotenv';
import { BUY_TICKETS_EXCHANGE, BUY_TICKETS_QUEUE } from './const.js';
import { addBuyTicketsAction } from './db.js';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

export const consumeMessages = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);

        const channel = await connection.createChannel();

        await channel.assertExchange(BUY_TICKETS_EXCHANGE, 'fanout', { durable: false });

        await channel.assertQueue(BUY_TICKETS_QUEUE, { durable: false });

        await channel.bindQueue(BUY_TICKETS_QUEUE, BUY_TICKETS_EXCHANGE, '');

        await channel.consume(BUY_TICKETS_QUEUE, async (msg) => {
            // TODO - Parse message, add to db
            console.log(`Consumer >>> received message: ${msg.content.toString()}`);
            const buyTicketsAction = JSON.parse(msg.content.toString());
            await addBuyTicketsAction(buyTicketsAction);
            channel.ack(msg);
        });


    } catch (error) {
        console.error(error);
    }
};