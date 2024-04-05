import * as amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

export class PublisherChannel {
    channel: amqp.Channel;

    // Method to create a channel on the RabbitMQ connection
    async createChannel() {
        const connection = await amqp.connect(RABBITMQ_URL);
        // Create a channel on this connection
        this.channel = await connection.createChannel();
    }

    // Method to send an event/message to a specified exchange
    async sendEvent(msg: string) {
        if (!this.channel) {
            await this.createChannel();
        }

        const exchange = 'comments_exchange';

        await this.channel.assertExchange(exchange, 'fanout', { durable: false });

        await this.channel.publish(exchange, '', Buffer.from(msg));
        console.log(`Publishing "${msg}" to "${exchange}"`);
    }
}