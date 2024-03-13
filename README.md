# taro 🧋

An app to stream messages from discord channels. Join the [server](https://discord.gg/GzMEqsUmaA) to try it out!

## Running Locally 

The project uses [devenv](https://devenv.sh) to setup the local environment. It will take care of setting up the RabbitMQ and Postgres services and provides some handy short-hands for running common tasks. The following assumes you have already created a discord bot with the required permissions (mentioned below) and added have it to an active server. 

### Setting up
The Postgres instance is disabled by default. To enable it, uncomment the following lines in `devenv.nix`, else you can use any running Postgres instance locally or on the cloud.
```
# services.postgres.enable = true;
# services.postgres.initialDatabases = [{ name = "db"; }];
```

Setup the environment variables
```bash
DISCORD_TOKEN=<Your Discord Bot Token Here>
RABBITMQ_URL=amqp://127.0.0.1:5672 
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/db
```

Run the RabbitMQ and Postgres services
```bash
devenv up
```

In another shell, run the server
```bash
devenv shell
dev
```

#### Setting up the discord bot
The bot requires permission to read messages and get the members in the server, both of which are [privileged gateway intents](https://discord.com/developers/docs/topics/gateway#privileged-intents) and must be enabled to read messages and list server members. 

## Architecture

The server establishes a discord [gateway](https://discord.com/developers/docs/topics/gateway) to listen in on incoming messages. On recieving a message it is pushed into the queue by the server for processing. The messages are then consumed by the server which then persists them into the db and publishes it to all clients subscribed to the channel via websockets.

### Tech Stack

The project was built with:
- [Bun](https://bun.sh)
- [Elysia](https://elysiajs.com/)
- [Lucia](https://lucia-auth.com/)
- [Drizzle](https://orm.drizzle.team/)
