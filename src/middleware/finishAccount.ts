import { defineMiddleware } from "astro:middleware";

export const finishAccount = defineMiddleware(async (context, next) => {
    if (context.url.pathname.includes("account") && !context.url.pathname.includes("finsih")) {
        const user = context.locals.user
        if (!user.installId) {
            return next(new Request(new URL("/account/finish-install", context.url), {
                headers: {
                    "x-redirect-to": context.url.pathname
                }
            }));
        }
        if (!user.plan) {
            return next(new Request(new URL("/account/finish-select-plan", context.url), {
                headers: {
                    "x-redirect-to": context.url.pathname
                }
            }));
        }

    }
    return next();
})

