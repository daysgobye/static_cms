import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia } from "lucia";
import { session } from "../entities/session/schema";
import { user, type UserPlan, type UserRoll } from "../entities/user/schema";
import appRunTime from "@lib/runtime";

declare module "lucia" {
    interface Register {
        Lucia: ReturnType<typeof getLucia>;
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


export const getLucia = (context) => {
    const appRT = appRunTime(context)
    const db = appRT.db
    const env = appRT.env
    //@ts-ignore
    const adapter = new DrizzleSQLiteAdapter(db, session, user);
    return new Lucia(adapter, {
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
}
