import amqp, { type Connection, type Channel, type Message } from "amqplib/callback_api";
import type { Message as DiscordMessage } from "../../db/schema";
import { processMessageFromQueue } from "../discord/handlers";

const rabbit_host = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const queue = "discord_message_task_queue";

export const RabbitProducer = () => {
    console.log('Producer: Connecting to RabbitMQ...');
    let producerChannel: Channel;
    amqp.connect(rabbit_host, async (err: any, connection: Connection) => {
        if (err) {
            throw err;
        }
        connection.createChannel((err: any, channel: Channel) => {
            if (err) {
                throw err;
            }
            producerChannel = channel;
            console.log('Producer: Connected to RabbitMQ');
        });
    });
    return (data: DiscordMessage) => {
        const msg = JSON.stringify(data);
        producerChannel.sendToQueue(queue, Buffer.from(msg));
    };
}

export const RabbitConsumer = () => {
    console.log('Consumer: Connecting to RabbitMQ...');
    return () => {
        amqp.connect(rabbit_host, (err, connection) => {
            if (err) {
                throw err;
            }
            connection.createChannel((err, channel) => {
                if (err) {
                    throw err
                }
                console.log('Consumer: Connected to RabbitMQ')
                channel.assertQueue(queue, { durable: true })
                channel.consume(queue, (msg: Message | null) => {
                    if (msg) {
                        const data: DiscordMessage = JSON.parse(msg.content.toString())
                        processMessageFromQueue(data);
                    }
                }, { noAck: true })
            })
        })
    }
}
