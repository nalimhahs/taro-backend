import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

import * as schema from './schema';

// for migrations
console.log('Processing migrations...');
const migrationClient = postgres(process.env.DATABASE_URL || "", { max: 1 });
await migrate(drizzle(migrationClient), { migrationsFolder: './db/migrations' })
console.log('Migrations complete!');
migrationClient.end();

// for query purposes
const queryClient = postgres(process.env.DATABASE_URL || "");
export const db = drizzle(queryClient, { schema });

// Generic functions for interacting with the database
export const getDiscordUser = async (id: string): Promise<schema.DiscordUser> => {
    const users = await db.select().from(schema.discord_users).where(eq(schema.discord_users.id, id));
    return users[0];
}

export const insertDiscordUser = async (user: schema.DiscordUser): Promise<schema.DiscordUser> => {
    const users = await db.insert(schema.discord_users).values(user).returning();
    return users[0];
}

export const insertMessage = async (message: schema.Message): Promise<schema.Message> => {
    const messages = await db.insert(schema.messages).values({...message, createdAt: new Date(message.createdAt)}).returning();
    return messages[0];
}

// Auth Methods
export const getAuthUser = async (email: string): Promise<schema.AuthUser> => {
    const users = await db.select().from(schema.auth_users).where(eq(schema.auth_users.email, email));
    return users[0];
}

export const insertAuthUser = async (user: schema.AuthUser): Promise<schema.AuthUser> => {
    const users = await db.insert(schema.auth_users).values(user).returning();
    return users[0];
}