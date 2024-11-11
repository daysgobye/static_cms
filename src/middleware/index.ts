
import { sequence } from "astro:middleware";
import { user } from "./user";
import { auth } from "./auth";
import { finishAccount } from "./finishAccount";



export const onRequest = sequence(user, auth, finishAccount)