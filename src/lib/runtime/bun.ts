import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { AppRuntime } from "./types";
const sqlite = new Database("sqlite.db");
const db = drizzle(sqlite);
const appRunTime: AppRuntime = { verify: Bun.password.verify, hash: Bun.password.hash, db }
export default appRunTime