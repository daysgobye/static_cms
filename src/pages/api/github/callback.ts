import type { APIContext } from "astro";
import { GitHub, type OAuth2Tokens } from "arctic";
import UserRepository from "@lib/entities/user/repository";
import { getLucia } from "@lib/auth";
import appRunTime from "@lib/runtime";
export async function GET(context: APIContext): Promise<Response> {
    try {
        const appRT = appRunTime(context)
        const db = appRT.db
        const lucia = getLucia(context)
        const github = new GitHub(
            appRT.env.GITHUB_CLIENT_ID,
            appRT.env.GITHUB_CLIENT_SECRET,
            null
        );
        const code = context.url.searchParams.get("code");
        const state = context.url.searchParams.get("state");
        const installationId = context.url.searchParams.get("installation_id");
        const storedState = context.cookies.get("github_oauth_state")?.value ?? null;
        const userRepository = new UserRepository(db)
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
        console.log(JSON.stringify(tokens, null, 2), tokens.accessToken())

        const githubUserResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${tokens.accessToken()}`,
                'User-Agent': 'request'

            }
        });
        console.log("POST RES")
        console.log("userRes", githubUserResponse.status,)
        const githubUser = await githubUserResponse.json() as Record<string, any>;
        console.log("user", githubUser, JSON.stringify(githubUser, null, 2))

        const githubUserId = githubUser.id;
        const existingUser = await userRepository.getByGitHubId(githubUserId)
        console.log("user2", existingUser, JSON.stringify(existingUser, null, 2))

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


        // console.log(existingUser)
        if (existingUser) {
            const session = await lucia.createSession(existingUser.id, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
            return context.redirect("/");
        }
        try {
            const response = await fetch("https://api.github.com/user/emails", {
                headers: {
                    Authorization: `Bearer ${tokens.accessToken()}`,
                    'User-Agent': 'request'

                }
            });
            const githubUsername = githubUser.login;
            const emails = await response.json() as unknown as { email: string, primary: boolean }[];
            const userEmail = emails.filter(email => email.primary === true)[0].email
            console.log("emails", emails, userEmail)
            const newUser = await userRepository.create({
                email: userEmail,
                password_hash: 'GITHUB',
                roll: 1,
                githubId: githubUserId,
                username: githubUsername,
                name: githubUser.name,
                plan: "Free"
            })
            const session = await lucia.createSession(newUser.id, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

            return context.redirect("/");

        } catch (error: any) {
            console.log(error)
            return new Response(
                JSON.stringify({
                    error,
                    msg: "making account"
                }));

        }
    } catch (error: any) {

        return new Response(error);
    }
}