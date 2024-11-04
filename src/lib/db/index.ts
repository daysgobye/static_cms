import { runtime } from "std-env";
import { db as bunDb } from "./bun";
import { db as d1Db } from "./d1";
import { db as bsql3 } from "./better-sqlite3";
import { DrizzleD1Database } from "drizzle-orm/d1";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
export type DbType = BunSQLiteDatabase | DrizzleD1Database | BetterSQLite3Database
let db: DbType = d1Db
switch (runtime) {
    case "bun":
        db = bunDb
        break;
    case "node":
        db = bsql3
        break;
    default:
        break;
}
export default db