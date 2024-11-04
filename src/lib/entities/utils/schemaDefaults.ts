import { sql } from "drizzle-orm";
import { text } from "drizzle-orm/sqlite-core";
export const schemaDefaults = {
    metadata: text('metadata', { mode: 'json' }).$type<Record<string, any>>(),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`)
        .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
}