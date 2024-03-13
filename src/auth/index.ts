import { Lucia } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";

import { db } from "../../db/db";
import { session_table, auth_users } from "../../db/schema";

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
    }
}

// Auth adapter
const authAdapter = new DrizzlePostgreSQLAdapter(db, session_table, auth_users);
export const lucia = new Lucia(authAdapter, {
    sessionCookie: {
        attributes: {
            secure: process.env.NODE_ENV === "production"
        }
    }
});
