import { lucia } from "@lib/auth";
import type { APIContext } from "astro";
import db from "@lib/db";
import UserRepository from "@lib/entities/user/repository";
import { getHashPassword, isValidEmail } from "@lib/auth/utils";

export async function POST(context: APIContext): Promise<Response> {
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
    const oldUser = await userRepository.getByEmail(email)

    if (oldUser) {
        return new Response("Email in use", {
            status: 400
        });
    }
    const hash = getHashPassword()
    const passwordHash = await hash(password);
    const newUser = await userRepository.create({
        email,
        password_hash: passwordHash,
        roll: 1
    })

    const session = await lucia.createSession(newUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return context.redirect("/account");
}