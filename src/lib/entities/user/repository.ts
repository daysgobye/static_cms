import type { DbType } from "@lib/db";
import { BaseRepository } from "../utils/repository";
import { user, type UserPlan, type UserRoll } from "./schema";
import { eq } from "drizzle-orm";


export type CreateUserInput = {
    email: string | null,
    password_hash: string
    roll: UserRoll
    plan?: UserPlan
    githubId?: number
    username?: string
}
export type UpdateUserInput = {
    roll?: UserRoll
    plan?: UserPlan
    githubId?: number
    installId: number
}
export default class UserRepository extends BaseRepository<typeof user> {
    constructor(db: DbType) {
        super(db, user)
    }
    create(user: CreateUserInput) {
        const lowerCaseEmail = user.email?.toLowerCase()
        return this._create({ ...user, email: lowerCaseEmail })
    }
    update(id: string, data: UpdateUserInput) {
        return this._update(id, data)
    }
    async getByEmail(email: string) {
        const lowerCaseEmail = email.toLowerCase()
        const userByEmail = await this.db.select().from(user).where(eq(user.email, lowerCaseEmail));
        if (userByEmail[0]) {
            return userByEmail[0]
        }
        return undefined
    }
    async getByGitHubId(githubId: number) {
        const userByGhId = await this.db.select().from(user).where(eq(user.githubId, githubId));
        if (userByGhId[0]) {
            console.log('got a user?', userByGhId)
            return userByGhId[0]
        }
        return undefined
    }

}