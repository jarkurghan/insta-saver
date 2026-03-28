import { Context } from "grammy";
import { eq } from "drizzle-orm";

import { bot } from "@/bot";
import { db, isu } from "@/db";
import { ADMIN_CHAT_ID } from "@/utils/constants";
import type { User } from "@/utils/types";


export function userLink(user: User): string {
    const fullName = `${user.first_name || "Noma'lum"} ${user.last_name || ""}`;
    return user.username ? `<a href="tg://resolve?domain=${user.username}">${fullName}</a>` : `<a href="tg://user?id=${user.tg_id}">${fullName}</a>`;
}

export async function saveUser(ctx: Context, prop?: { utm?: string }): Promise<User[]> {
    try {
        const user = ctx.from;
        if (!user) return [];

        const userData: User = {
            tg_id: user.id,
            first_name: user.first_name,
            last_name: user.last_name || null,
            username: user.username || null,
        };

        // to-do: referred_by qo'shish
        // to-do: today_count va total_count qo'shish
        // to-do: status qo'shish

        const tgIdKey = String(userData.tg_id);
        const existing = await db.select({ tg_id: isu.tg_id }).from(isu).where(eq(isu.tg_id, tgIdKey)).limit(1);
        if (existing.length === 0) {
            const utm = prop?.utm || "-";
            const username = user.username ? `@${user.username}` : "Noma'lum";
            const userlink = userLink(userData);
            const msg =
                `🆕 Yangi foydalanuvchi:\n\n👤 Ism: ${userlink}\n🔗 Username: ${username}\n` +
                `🆔 ID: <code>${user.id}</code>\n🚪 Qayerdan kelgan: ${utm}\n🤖 Bot: @insta_yuklagich_bot`;
            await bot.api.sendMessage(ADMIN_CHAT_ID, msg, { parse_mode: "HTML" });
        }

        try {
            const rows = await db
                .insert(isu)
                .values({
                    tg_id: tgIdKey,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    username: userData.username,
                })
                .onConflictDoUpdate({
                    target: [isu.tg_id],
                    set: {
                        first_name: userData.first_name,
                        last_name: userData.last_name,
                        username: userData.username,
                        updated_at: new Date(),
                    },
                })
                .returning();

            return rows.map(
                (row): User => ({
                    id: row.id,
                    tg_id: row.tg_id ?? tgIdKey,
                    first_name: row.first_name ?? "",
                    last_name: row.last_name,
                    username: row.username,
                }),
            );
        } catch (err) {
            console.error("PostgreSQL/Drizzle ga saqlashda xato:", err);
            return [];
        }
    } catch (err) {
        console.error(err);

        return []
    }
}

