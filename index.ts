import { exit } from 'process';

import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'

import * as discord from "./src/discord";
import * as queue from "./src/queue";
import { authApp } from './src/auth/routes';
import { discordApp } from './src/discord/routes';
import { validateAuthHeader } from './src/auth/utils';
import { socketApp } from './src/socket';


const messageConsumer = queue.RabbitConsumer();
const setup = async () => {
    await discord.connect();
    messageConsumer();
}
await setup();

export const app = new Elysia();
app.group('/api/v1', (app) => 
    app
        .use(cors())
        .use(authApp)
        .use(socketApp)
        .guard({
            async beforeHandle({ set, headers }) {
                const isValid = await validateAuthHeader(headers).then((valid) => valid)
                if (!isValid) {
                    return set.status = 'Unauthorized'
                }
            }
        }, 
        (app) => 
            app
                .use(discordApp)
        )
)
app.listen(8000);

const teardown = async () => {
    await discord.disconnect();
}

process.on('SIGINT' || 'exit', async () => {
    await teardown();
    exit(0);
});
