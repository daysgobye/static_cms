import { defineConfig } from "drizzle-kit"
export default defineConfig({
    schema: "./src/lib/entities/**/schema.ts",
    dialect: "sqlite",
    out: "./drizzle",
    dbCredentials: {
        url: 'sqlite.db',
    }
})