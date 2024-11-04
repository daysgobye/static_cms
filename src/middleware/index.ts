
import { sequence } from "astro:middleware";
import { user } from "./user";
import { auth } from "./auth";


export const onRequest = sequence(user, auth)