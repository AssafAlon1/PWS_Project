import * as amqp from 'amqplib';
import dotenv from 'dotenv';
import { BUY_TICKETS_EXCHANGE, BUY_TICKETS_QUEUE } from './const.js';
import { addBuyTicketsAction } from './db.js';
import Joi from 'joi';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

const buyTicketSchema = Joi.object({
    purchase_id: Joi.string().required(),
    event_id: Joi.string().required(),
    ticket_amount: Joi.number().integer().required(),
}).unknown(true);

export const consumeMessages = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);

        const channel = await connection.createChannel();

        await channel.assertExchange(BUY_TICKETS_EXCHANGE, 'fanout', { durable: false });

        await channel.assertQueue(BUY_TICKETS_QUEUE, { durable: false });

        await channel.bindQueue(BUY_TICKETS_QUEUE, BUY_TICKETS_EXCHANGE, '');

        await channel.consume(BUY_TICKETS_QUEUE, async (msg) => {
            console.log(`Consumer >>> received message: ${msg.content.toString()} for bought tickets`);
            const buyTicketsAction = JSON.parse(msg.content.toString());
            const { error } = buyTicketSchema.validate(buyTicketsAction);
            if (error) {
                console.error(error);
                channel.ack(msg);
                return;
            }
            await addBuyTicketsAction(buyTicketsAction);
            channel.ack(msg);
        });


    } catch (error) {
        console.error(error);
    }
};