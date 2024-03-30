import * as amqp from 'amqplib';
import dotenv from 'dotenv';
import { REFUND_TICKETS_EXCHANGE, REFUND_TICKETS_QUEUE } from './const.js';
import { updateRefund } from './db.js';
import Joi from 'joi';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

const refundTicketSchema = Joi.object({
    event_id: Joi.string().required(),
    ticket_name: Joi.string().required(),
    ticket_amount: Joi.number().integer().required(),
});

export const consumeMessages = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);

        const channel = await connection.createChannel();

        await channel.assertExchange(REFUND_TICKETS_EXCHANGE, 'fanout', { durable: false });

        await channel.assertQueue(REFUND_TICKETS_QUEUE, { durable: false });

        await channel.bindQueue(REFUND_TICKETS_QUEUE, REFUND_TICKETS_EXCHANGE, '');

        await channel.consume(REFUND_TICKETS_QUEUE, async (msg) => {
            console.log(`Consumer >>> received message: ${msg.content.toString()}`);
            const refundTicketsAction = JSON.parse(msg.content.toString());
            const { error } = refundTicketSchema.validate(refundTicketsAction);
            if (error) {
                console.error(error);
                channel.ack(msg);
                return;
            }
            await updateRefund(refundTicketsAction.event_id, refundTicketsAction.ticket_name, refundTicketsAction.ticket_amount);
            channel.ack(msg);
        });


    } catch (error) {
        console.error(error);
    }
};