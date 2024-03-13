import postgres from "postgres";
import { WebSocketShardEvents } from "@discordjs/ws";
import { Routes } from '@discordjs/core';

import { discordWebsocketManager, rest } from ".";
import type { DiscordUser, Message } from "../../db/schema";
import { RabbitProducer } from "../queue";
import { getDiscordUser, insertDiscordUser, insertMessage } from "../../db/db";
import { pushMessage } from "../socket";


// Incoming handlers
const enqueueMessageData = RabbitProducer();
export const handleIncomingMessages = async () => {
    discordWebsocketManager.on(WebSocketShardEvents.Dispatch, async (event) => {
        if (event.data.t !== 'MESSAGE_CREATE') return;
        const data: Message = {
            messageId: event.data.d.id,
            messageContent: event.data.d.content,
            createdAt: new Date(event.data.d.timestamp),
            channelId: event.data.d.channel_id,
            serverId: event.data.d.guild_id,
            referencedMessageId: event.data.d.referenced_message?.id ?? "",
            userId: event.data.d.author.id,
        };
        enqueueMessageData(data);
    });
}

// Outgoing handlers
export const processMessageFromQueue = async (data: Message) => {
    try {
        await insertMessage(data);
    } catch (error: any) {
        if (error instanceof postgres.PostgresError && error.code === '23503') {
            const userData = await rest.get(Routes.user(data.userId)) as any;
            const newUser: DiscordUser = {
                id: userData.id,
                userName: userData.username,
                profilePicture: userData.avatar,
            }
            await insertDiscordUser(newUser);
            await insertMessage(data);
        } else if (error instanceof postgres.PostgresError && error.code === '23505') {
            console.log('Duplicate message: ' + data.messageContent);
        } else {
            throw error;
        }
    }
    // TODO: cache the user on redis
    pushMessage(data.serverId + '-' + data.channelId, { message: data, author: await getDiscordUser(data.userId)});
}