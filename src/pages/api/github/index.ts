import { generateState } from "arctic";
import { env } from "std-env";

import type { APIContext } from "astro";
import { github } from "@lib/auth/oauth";

export async function GET(context: APIContext): Promise<Response> {
    const state = generateState();
    const url = github.createAuthorizationURL(state, ["user:email", "repo"]);

    context.cookies.set("github_oauth_state", state, {
        path: "/",
        secure: env.PROD === "true",
        httpOnly: true,
        maxAge: 60 * 120, // 10 minutes
        sameSite: "lax"
    });

    return context.redirect(url.toString());
}