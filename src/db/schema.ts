import { integer, pgTable, text, varchar, uniqueIndex, timestamp } from "drizzle-orm/pg-core";

export const isu = pgTable(
    "insta_saver_users",
    {
        id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
        tg_id: varchar("tg_id", { length: 255 }),
        first_name: text("first_name"),
        last_name: text("last_name"),
        username: text("username"),
        referred_by: integer("referred_by"),
        today_count: integer("today_count").default(0).notNull(),
        total_count: integer("total_count").default(0).notNull(),
        status: text("status", { enum: ["active", "deleted_account", "has_blocked", "other"] })
            .default("active")
            .notNull(),
        created_at: timestamp("created_at").defaultNow().notNull(),
        updated_at: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => [uniqueIndex("insta_saver_users_tg_id_unique").on(table.tg_id)],
);

export const isg = pgTable(
    "insta_saver_groups",
    {
        id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
        chat_id: varchar("chat_id", { length: 255 }),
        chat_name: text("chat_name"),
        chat_username: text("chat_username"),
        added_by_username: text("added_by_username"),
        added_by_tg_id: varchar("added_by_tg_id", { length: 255 }),
        added_by_full_name: text("added_by_full_name"),
        today_count: integer("today_count").default(0).notNull(),
        total_count: integer("total_count").default(0).notNull(),
        status: text("status", { enum: ["active", "left", "kicked", "other"] })
            .default("active")
            .notNull(),
        created_at: timestamp("created_at").defaultNow().notNull(),
        updated_at: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => [uniqueIndex("insta_saver_groups_chat_id_unique").on(table.chat_id)],
);
