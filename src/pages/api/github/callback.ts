import type { APIContext } from "astro";
import type { OAuth2Tokens } from "arctic";
import { github } from "@lib/auth/oauth";
import UserRepository from "@lib/entities/user/repository";
import db from "@lib/db";
import { lucia } from "@lib/auth";

export async function GET(context: APIContext): Promise<Response> {
    const code = context.url.searchParams.get("code");
    const state = context.url.searchParams.get("state");
    const installationId = context.url.searchParams.get("installation_id");
    const storedState = context.cookies.get("github_oauth_state")?.value ?? null;
    const userRepository = new UserRepository(db)
    console.log(storedState, state)
    if (code === null) {
        return new Response(null, {
            status: 400
        });
    }
    let tokens: OAuth2Tokens;
    try {
        tokens = await github.validateAuthorizationCode(code);
    } catch (e) {
        return new Response(null, {
            status: 400
        });
    }

    const githubUserResponse = await fetch("https://api.github.com/user", {
        headers: {
            Authorization: `Bearer ${tokens.accessToken()}`
        }
    });
    const githubUser = await githubUserResponse.json() as Record<string, any>;
    const githubUserId = githubUser.id;
    const githubUsername = githubUser.login;
    const existingUser = await userRepository.getByGitHubId(githubUserId)

    if (existingUser && installationId) {
        try {
            await userRepository.update(existingUser.id, { installId: Number(installationId) })
        } catch (error) {
            console.log('error adding install id', error)
            return new Response(null, {
                status: 400
            });
        }
        return context.redirect("/");
    }
    //TODO: fix this 
    // if (state === null || storedState === null) {
    //     return new Response(null, {
    //         status: 400
    //     });
    // }
    // if (state !== storedState) {
    //     return new Response(null, {
    //         status: 400
    //     });
    // }



    if (existingUser) {
        const session = await lucia.createSession(existingUser.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        return context.redirect("/");
    }

    const response = await fetch("https://api.github.com/user/emails", {
        headers: {
            Authorization: `Bearer ${tokens.accessToken()}`
        }
    });
    const emails = await response.json() as unknown as { email: string, primary: boolean }[];
    const userEmail = emails.filter(email => email.primary === true)[0].email

    const newUser = await userRepository.create({
        email: userEmail,
        password_hash: 'GITHUB',
        roll: 1,
        githubId: githubUserId,
        username: githubUsername,
        name: githubUser.name
    })
    const session = await lucia.createSession(newUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return context.redirect("/");
}