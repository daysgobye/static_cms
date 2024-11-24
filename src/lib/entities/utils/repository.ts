import { DbType } from "@lib/runtime/types";
import { eq, sql } from "drizzle-orm";

import { type AnySQLiteTable } from "drizzle-orm/sqlite-core";

export class BaseRepository<T extends AnySQLiteTable> {
    db: DbType
    table: T
    constructor(db: DbType, table: T) {
        this.db = db
        this.table = table
    }
    async all() {
        return await this.db.select().from(this.table);
    }
    async _list(query: any) {
        return await this.db.select().from(this.table).where(query);
    }
    async _create(data: any) {
        const newItem = await this.db.insert(this.table).values(data).returning()
        return newItem[0]
    }
    async _update(id: string, data: any) {
        return await this.db.update(this.table)
            .set({ ...data, updatedAt: Date.now() })
            //@ts-ignore
            .where(eq(this.table.id, id));
    }
    async _delete(id: string) {
        return await this.db.delete(this.table)
            //@ts-ignore
            .where(eq(this.table.id, id));
    }
    async _get(id: string) {
        return await this.db.select()
            .from(this.table)
            //@ts-ignore
            .where(eq(this.table.id, id));
    }
    async list(query: any) {
        return await this._list(query)
    }
    async create(data: any) {
        return await this._create(data)
    }
    async update(id: string, data: any) {
        return await this._update(id, data)
    }
    async delete(id: string) {
        return await this._delete(id)
    }
    async get(id: string) {
        return await this._get(id)
    }

}