import { Context } from "grammy";
import { eq } from "drizzle-orm";

import { db, isg, isu } from "@/db";
import type { Group, GroupStatus, User } from "@/utils/types";
import { notifyAdmin } from "@/services/admin-chat";
import { formatLogError, sendLog } from "@/services/log";


export function userLink(user: User): string {
    const fullName = `${user.first_name || "Noma'lum"} ${user.last_name || ""}`;
    return user.username ? `<a href="tg://resolve?domain=${user.username}">${fullName}</a>` : `<a href="tg://user?id=${user.tg_id}">${fullName}</a>`;
}

export function groupLink(chat: { id: number; title?: string; username?: string | null }): string {
    const name = chat.title || "Noma'lum";
    return chat.username ? `<a href="https://t.me/${chat.username}">${name}</a>` : name;
}

export async function saveUser(ctx: Context, prop?: { utm?: string, today_count?: number, total_count?: number }): Promise<User[]> {
    try {
        const user = ctx.from;
        if (!user) return [];

        const userData: User = {
            tg_id: user.id,
            first_name: user.first_name,
            last_name: user.last_name || null,
            username: user.username || null,
        };

        if (prop?.today_count) {
            userData.today_count = prop.today_count;
        }
        if (prop?.total_count) {
            userData.total_count = prop.total_count;
        }

        // to-do: referred_by qo'shish
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
            await notifyAdmin(msg);
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
            await sendLog(`<b>saveUser (DB)</b>\n<pre>${formatLogError(err)}</pre>`, { parse_mode: "HTML" });
            return [];
        }
    } catch (err) {
        await sendLog(`<b>saveUser</b>\n<pre>${formatLogError(err)}</pre>`, { parse_mode: "HTML" });

        return []
    }
}

export async function saveGroup(
    ctx: Context,
    prop?: { today_count?: number; total_count?: number; status?: GroupStatus },
): Promise<Group[]> {
    try {
        const chat = ctx.chat;
        if (!chat || (chat.type !== "group" && chat.type !== "supergroup")) return [];

        const from = ctx.from;
        const chatIdKey = String(chat.id);

        const groupStatus: GroupStatus = prop?.status ?? "active";

        const groupData: Group = {
            chat_id: chatIdKey,
            chat_name: chat.title ?? null,
            chat_username: chat.username ?? null,
            status: groupStatus,
        };

        const existing = await db.select({ chat_id: isg.chat_id }).from(isg).where(eq(isg.chat_id, chatIdKey)).limit(1);
        if (existing.length === 0) {
            const chatlink = groupLink(chat);
            const username = chat.username ? `@${chat.username}` : "Noma'lum";
            const addedBy = from
                ? `👤 Qo'shgan: ${userLink({
                      tg_id: from.id,
                      first_name: from.first_name,
                      last_name: from.last_name ?? null,
                      username: from.username ?? null,
                  })}\n`
                : "";
            const msg =
                `🆕 Yangi guruh:\n\n👥 Chat: ${chatlink}\n🔗 Username: ${username}\n${addedBy}` +
                `🆔 ID: <code>${chat.id}</code>\n🤖 Bot: @insta_yuklagich_bot`;
            await notifyAdmin(msg);
        }

        try {
            const rows = await db
                .insert(isg)
                .values({
                    chat_id: chatIdKey,
                    chat_name: groupData.chat_name,
                    chat_username: groupData.chat_username,
                    added_by_username: from?.username ?? null,
                    added_by_tg_id: from ? String(from.id) : null,
                    added_by_full_name: from
                        ? `${from.first_name || ""} ${from.last_name || ""}`.trim() || null
                        : null,
                    today_count: prop?.today_count ?? 0,
                    total_count: prop?.total_count ?? 0,
                    status: groupStatus,
                })
                .onConflictDoUpdate({
                    target: [isg.chat_id],
                    set: {
                        chat_name: groupData.chat_name,
                        chat_username: groupData.chat_username,
                        status: groupStatus,
                        updated_at: new Date(),
                    },
                })
                .returning();

            return rows.map(
                (row): Group => ({
                    id: row.id,
                    chat_id: row.chat_id ?? chatIdKey,
                    chat_name: row.chat_name,
                    chat_username: row.chat_username,
                    added_by_username: row.added_by_username,
                    added_by_tg_id: row.added_by_tg_id,
                    added_by_full_name: row.added_by_full_name,
                    status: row.status as GroupStatus,
                }),
            );
        } catch (err) {
            await sendLog(`<b>saveGroup (DB)</b>\n<pre>${formatLogError(err)}</pre>`, { parse_mode: "HTML" });
            return [];
        }
    } catch (err) {
        await sendLog(`<b>saveGroup</b>\n<pre>${formatLogError(err)}</pre>`, { parse_mode: "HTML" });
        return [];
    }
}
