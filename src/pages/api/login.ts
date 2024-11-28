import { getLucia } from "@lib/auth";
import { isValidEmail } from "@lib/auth/utils";
import UserRepository from "@lib/entities/user/repository";
import type { APIContext } from "astro";
import appRunTime from "@lib/runtime";

export async function POST(context: APIContext): Promise<Response> {
    const appRT = appRunTime(context)
    const db = appRT.db
    const verify = appRT.verify
    const lucia = getLucia(context)

    const userRepository = new UserRepository(db)
    const formData = await context.request.formData();
    const rawEmail = formData.get("email") as string;
    const email: string = rawEmail.toLowerCase()
    if (!isValidEmail(email)) {
        return new Response("Invalid email", {
            status: 400
        });
    }
    const password = formData.get("password");
    if (typeof password !== "string" || password.length < 6 || password.length > 255) {
        return new Response("Invalid password", {
            status: 400
        });
    }

    const existingUser = await userRepository.getByEmail(email)

    if (!existingUser) {
        // NOTE:
        // Returning immediately allows malicious actors to figure out valid usernames from response times,
        // allowing them to only focus on guessing passwords in brute-force attacks.
        // As a preventive measure, you may want to hash passwords even for invalid usernames.
        // However, valid usernames can be already be revealed with the signup page among other methods.
        // It will also be much more resource intensive.
        // Since protecting against this is non-trivial,
        // it is crucial your implementation is protected against brute-force attacks with login throttling etc.
        // If usernames are public, you may outright tell the user that the username is invalid.
        return new Response("Incorrect username or password", {
            status: 400
        });
    }
    const validPassword = await verify(existingUser.password_hash, password);
    if (!validPassword) {
        return new Response("Incorrect username or password", {
            status: 400
        });
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return context.redirect("/account");
}