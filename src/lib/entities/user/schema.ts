import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core";
import { schemaDefaults } from "../utils/schemaDefaults";
import { generateIdFromEntropySize } from "lucia";
export type UserRoll = 3 | 2 | 1
export type UserPlan = "Free" | "Base" | "Pro" | null
export const user = sqliteTable("user", {
    githubId: integer('github_id').unique(),
    username: text("username"),
    name: text('name'),
    installId: integer('install_id'),
    email: text("email").unique(),
    password_hash: text("password_hash").notNull(),
    roll: integer('roll').$type<UserRoll>().default(1),
    plan: text('plan').$type<UserPlan>(),
    id: text("id")
        .primaryKey()
        .$defaultFn(() => `user_${generateIdFromEntropySize(10)}`),
    ...schemaDefaults

});

export type User = typeof user.$inferSelect