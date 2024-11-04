import { drizzle } from 'drizzle-orm/d1';
import { env } from "std-env";
const d1Binding = env.BINDING_NAME

//@ts-ignore
export const db = drizzle(d1Binding);