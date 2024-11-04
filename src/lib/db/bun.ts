import { drizzle } from "drizzle-orm/bun-sqlite";
import { runtime } from "std-env";

let sqlite
if (runtime == "bun") {
    const database = await import("bun:sqlite");
    sqlite = new database.default("sqlite.db");
}
//@ts-ignore
export const db = drizzle(sqlite);
