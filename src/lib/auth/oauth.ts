import { GitHub } from "arctic";
import { env } from "std-env";
export const github = new GitHub(
    //@ts-ignore
    import.meta.env.GITHUB_CLIENT_ID,
    //@ts-ignore
    import.meta.env.GITHUB_CLIENT_SECRET,
    null
);