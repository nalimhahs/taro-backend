import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Discord tables
export const discord_users = pgTable('users', {
    id: text('id').primaryKey(),
    userName: text('username').notNull(),
    profilePicture: text('profile_picture'),
});

export const messages = pgTable('messages', {
    id: uuid('id').defaultRandom().primaryKey(),
    messageId: text('message_id'),
    messageContent: text('message_content'),
    userId: text('user_id').references(() => discord_users.id).notNull(),
    createdAt: timestamp('created_at').notNull(),
    channelId: text('channel_id').notNull(),
    serverId: text('server_id'),
    referencedMessageId: text('referenced_message_id'),
});

export type DiscordUser = typeof discord_users.$inferSelect; 
export type Message = typeof messages.$inferInsert;


// Auth tables
export const auth_users = pgTable("user", {
	id: text("id").primaryKey(),
    email: text("email").unique(),
    hashedPassword: text("hashed_password")
});

export const session_table = pgTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => auth_users.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date"
	}).notNull()
});

export type AuthUser = typeof auth_users.$inferSelect;
export type Session = typeof session_table.$inferSelect;