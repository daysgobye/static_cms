import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { schemaDefaults } from "../utils/schemaDefaults";
import { user } from "../user/schema";

export const session = sqliteTable("session", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id),
    expiresAt: integer("expires_at").notNull(),
    ...schemaDefaults

});
