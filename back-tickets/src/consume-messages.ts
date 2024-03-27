import * as amqp from 'amqplib';
import dotenv from 'dotenv';
import { REFUND_TICKETS_EXCHANGE, REFUND_TICKETS_QUEUE } from './const.js';
import { updateRefund } from './db.js';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

export const consumeMessages = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);

        const channel = await connection.createChannel();

        await channel.assertExchange(REFUND_TICKETS_EXCHANGE, 'fanout', { durable: false });

        await channel.assertQueue(REFUND_TICKETS_QUEUE, { durable: false });

        await channel.bindQueue(REFUND_TICKETS_QUEUE, REFUND_TICKETS_EXCHANGE, '');

        await channel.consume(REFUND_TICKETS_QUEUE, async (msg) => {
            // TODO - Parse message, update db
            console.log(`Consumer >>> received message: ${msg.content.toString()}`);
            const buyTicketsAction = JSON.parse(msg.content.toString());
            await updateRefund( buyTicketsAction.event_id, buyTicketsAction.ticket_name, buyTicketsAction.ticket_amount );
            channel.ack(msg);
        });


    } catch (error) {
        console.error(error);
    }
};