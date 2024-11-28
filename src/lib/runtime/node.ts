import { drizzle } from 'drizzle-orm/better-sqlite3';
//@ts-ignore
import Database from 'better-sqlite3';
import { verify, hash } from "@node-rs/argon2";
import type { AppRuntime } from './types';

const hashPass = async (password: string) => hash(password, {
    // recommended minimum parameters
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
})
const verifyPass = async (storedHash: string, password: string) => verify(storedHash, password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
})
const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite);
//@ts-ignore
const appRunTime = (context: any): AppRuntime => ({ verify: verifyPass, hash: hashPass, db, env: import.meta.env })
export default appRunTime