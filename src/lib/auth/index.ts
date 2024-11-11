import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia } from "lucia";
import db from "../db";
import { session } from "../entities/session/schema";
import { user, type UserPlan, type UserRoll } from "../entities/user/schema";
import { env } from "std-env";

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

interface DatabaseUserAttributes {
    email: string;
    roll: UserRoll
    plan: UserPlan
    githubId: number
    installId: number | null
    name: string
}

const adapter = new DrizzleSQLiteAdapter(db, session, user);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            // set to `true` when using HTTPS
            secure: env.PROD === "true"
        }
    },
    getUserAttributes: (attributes) => {
        return {
            name: attributes.name,
            email: attributes.email,
            roll: attributes.roll,
            plan: attributes.plan,
            githubId: attributes.githubId,
            installId: attributes.installId
        };
    }
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
    }
}