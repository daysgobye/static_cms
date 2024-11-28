import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { type AppRuntime } from "./types";
const sqlite = new Database("sqlite.db");
const db = drizzle(sqlite);
const appRunTime = (context: any): AppRuntime => ({ verify: Bun.password.verify, hash: Bun.password.hash, db, env: Bun.env })
export default appRunTime