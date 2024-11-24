import { GitHub } from "arctic";
export const github = new GitHub(
    //@ts-ignore
    import.meta.env.GITHUB_CLIENT_ID,
    //@ts-ignore
    import.meta.env.GITHUB_CLIENT_SECRET,
    null
);