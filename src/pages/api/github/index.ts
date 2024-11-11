import { generateState } from "arctic";
import type { APIContext } from "astro";
import { github } from "@lib/auth/oauth";

export async function GET(context: APIContext): Promise<Response> {
    const state = generateState();
    const url = github.createAuthorizationURL(state, ["user:email"]);

    context.cookies.set("github_oauth_state", state, {
        path: "/",
        //@ts-ignore
        secure: import.meta.env.PROD,
        httpOnly: true,
        maxAge: 60 * 10, // 10 minutes
        sameSite: "lax"
    });
    console.log(context.cookies.get("github_oauth_state"))
    return context.redirect(url.toString());
}