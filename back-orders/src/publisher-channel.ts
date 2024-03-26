import * as amqp from 'amqplib';
import dotenv from 'dotenv';
import { BUY_TICKETS_EXCHANGE, REFUND_TICKETS_EXCHANGE } from './const.js';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

export class PublisherChannel {
    buyChannel: amqp.Channel;
    refundChannel: amqp.Channel;

    async createBuyChannel() {
        const connection = await amqp.connect(RABBITMQ_URL);
        this.buyChannel = await connection.createChannel();
    }

    async createRefundChannel() {
        const connection = await amqp.connect(RABBITMQ_URL);
        this.refundChannel = await connection.createChannel();
    }

    async sendBuyEvent(msg: string) {
        if (!this.buyChannel) {
            await this.createBuyChannel();
        }

        await this.buyChannel.assertExchange(BUY_TICKETS_EXCHANGE, 'fanout', { durable: false });
        await this.buyChannel.publish(BUY_TICKETS_EXCHANGE, '', Buffer.from(msg));
        console.log(
            `Publisher >>> | message "${msg}" published to exchange "${BUY_TICKETS_EXCHANGE}"`
        );
    }

    async sendRefundEvent(msg: string) {
        if (!this.refundChannel) {
            await this.createRefundChannel();
        }

        await this.refundChannel.assertExchange(REFUND_TICKETS_EXCHANGE, 'fanout', { durable: false });

        await this.refundChannel.publish(REFUND_TICKETS_EXCHANGE, '', Buffer.from(msg));
        console.log(
            `Publisher >>> | message "${msg}" published to exchange "${REFUND_TICKETS_EXCHANGE}"`
        );
    }
}