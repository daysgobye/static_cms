import { defineMiddleware } from "astro:middleware";

export const auth = defineMiddleware(async (context, next) => {
    if (context.url.pathname.includes("account") && !context.locals.user) {
        return next(new Request(new URL("/login", context.url), {
            headers: {
                "x-redirect-to": context.url.pathname
            }
        }));
    }
    return next();
})

