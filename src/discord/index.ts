import { WebSocketManager } from '@discordjs/ws';
import { REST } from '@discordjs/rest';
import { GatewayIntentBits } from '@discordjs/core';
import { handleIncomingMessages } from './handlers';

const token = process.env.DISCORD_TOKEN || '';
export const rest = new REST().setToken(token);

export const discordWebsocketManager = new WebSocketManager({
    token,
    intents: GatewayIntentBits.GuildMessages | GatewayIntentBits.GuildMembers | GatewayIntentBits.MessageContent,
    rest,
});

let isReady = false;

export const connect = async () => {
    if (isReady) return;
    await discordWebsocketManager.connect();
    handleIncomingMessages();
    isReady = true;
    console.log('Connected to Discord!', );
}

export const disconnect = async () => {
    await discordWebsocketManager.destroy();
}
