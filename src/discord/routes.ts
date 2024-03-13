import { Elysia } from 'elysia';
import { Routes } from '@discordjs/core';

import { rest } from "./index";

export const discordApp = new Elysia();

discordApp.group('/discord', (app) => 
    app
        .get('/servers', async () => {
            // TODO: cache the servers
            const servers = await rest.get(Routes.userGuilds()) as any[];
            const serverList = await Promise.all(servers.map(async (server) => {
                const channels = await rest.get(Routes.guildChannels(server.id)) as any[];
                const data = {
                    id: server.id,
                    name: server.name,
                    channels: channels.map((channel) => { if (channel.type === 0) return { id: channel.id, name: channel.name } }).filter(e => e),
                }
                return data;
            }));
            return serverList;
        })
)