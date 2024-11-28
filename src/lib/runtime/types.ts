import { DrizzleD1Database } from "drizzle-orm/d1";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
export type DbType = BunSQLiteDatabase | DrizzleD1Database | BetterSQLite3Database
export type AppRuntime = {
    hash: (
        password: string,
    ) => Promise<string>
    verify: (
        storedHash: string,
        passwordAttempt: string,
    ) => Promise<boolean>
    db: DbType
    env: Record<string, string>
}