import { GitHub } from "arctic";
import { env } from "std-env";
console.log(env)
export const github = new GitHub(
    import.meta.env.GITHUB_CLIENT_ID,
    import.meta.env.GITHUB_CLIENT_SECRET,
    null
);