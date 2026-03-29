import { Context, type Filter } from "grammy";
import type { ChatMember } from "@grammyjs/types";
import type { GroupStatus, User } from "@/utils/types";
import { saveGroup } from "@/services/save-user";
import { saveUser } from "@/services/save-user";
import { groupLink, userLink } from "@/services/save-user";
import { notifyAdmin } from "@/services/admin-chat";
import { formatLogError, sendLog } from "@/services/log";
import { eq } from "drizzle-orm";
import { isg, isu } from "@/db";
import { db } from "@/db";

function groupStatusFromChatMember(member: ChatMember): GroupStatus {
    switch (member.status) {
        case "member":
        case "administrator":
        case "restricted":
        case "creator":
            return "active";
        case "left":
            return "left";
        case "kicked":
            return "kicked";
        default:
            return "other";
    }
}

export async function registerChatMember(ctx: Filter<Context, "my_chat_member">) {
    try {
        if (ctx.chat.type === "group" || ctx.chat.type === "supergroup") {
            await addToGroup(ctx);
        } else if (ctx.chat.type === "private") {
            await onHasBlocked(ctx);
        }
    } catch (err) {
        await sendLog(`<b>registerChatMember</b>\n<pre>${formatLogError(err)}</pre>`, {
            parse_mode: "HTML",
        });
    }
}

export async function addToGroup(ctx: Filter<Context, "my_chat_member">) {
    try {
        const mapped = groupStatusFromChatMember(ctx.myChatMember.new_chat_member);
        const chatIdKey = String(ctx.chat.id);
        const chat = ctx.chat;

        if (mapped === "left" || mapped === "kicked") {
            const [beforeRow] = await db.select({ status: isg.status }).from(isg).where(eq(isg.chat_id, chatIdKey)).limit(1);
            await db.update(isg).set({ status: mapped, updated_at: new Date() }).where(eq(isg.chat_id, chatIdKey));
            if (beforeRow && beforeRow.status !== mapped) {
                const gl = groupLink({ id: chat.id, title: chat.title, username: chat.username ?? null });
                await notifyAdmin(
                    `📛 <b>Guruh statusi o'zgardi</b>\n<code>${beforeRow.status}</code> → <b>${mapped}</b>\n\n👥 ${gl}\n🆔 <code>${chat.id}</code>`,
                );
            }
            return;
        }

        const [beforeRow] = await db.select({ status: isg.status }).from(isg).where(eq(isg.chat_id, chatIdKey)).limit(1);
        await saveGroup(ctx, { status: mapped });

        if (beforeRow && beforeRow.status !== mapped) {
            const gl = groupLink({ id: chat.id, title: chat.title, username: chat.username ?? null });
            await notifyAdmin(
                `📛 <b>Guruh statusi o'zgardi</b>\n<code>${beforeRow.status}</code> → <b>${mapped}</b>\n\n👥 ${gl}\n🆔 <code>${chat.id}</code>`,
            );
        }

        const replyText =
            "Guruhga qo'shilganimdan xursandman! Men **instagram video havolasini** yuborilsa darxol o'sha videoni tashlab beraman";
        await ctx.reply(replyText, { parse_mode: "Markdown" });
    } catch (err) {
        await sendLog(`<b>addToGroup</b>\n<pre>${formatLogError(err)}</pre>`, {
            parse_mode: "HTML",
        });
    }
}

export async function onHasBlocked(ctx: Filter<Context, "my_chat_member">) {
    try {
        if (ctx.chat.type !== "private") return;

        const [user] = await saveUser(ctx);
        if (!user) return;

        const userData: User = {
            tg_id: user.tg_id,
            first_name: user.first_name,
            last_name: user.last_name || null,
            username: user.username || null,
        };

        const tgKey = String(userData.tg_id);
        const [beforeRow] = await db.select({ status: isu.status }).from(isu).where(eq(isu.tg_id, tgKey)).limit(1);

        if (ctx.myChatMember.new_chat_member.status === "kicked") {
            await db.update(isu).set({ status: "has_blocked", updated_at: new Date() }).where(eq(isu.tg_id, tgKey));
            if (!beforeRow || beforeRow.status !== "has_blocked") {
                await notifyAdmin(
                    `📛 <b>Foydalanuvchi statusi o'zgardi</b>\n<code>${beforeRow?.status ?? "—"}</code> → <b>has_blocked</b>\n\n👤 ${userLink(userData)}\n🆔 <code>${userData.tg_id}</code>`,
                );
            }
        } else if (ctx.myChatMember.new_chat_member.status === "member") {
            await db.update(isu).set({ status: "active", updated_at: new Date() }).where(eq(isu.tg_id, tgKey));
            if (!beforeRow || beforeRow.status !== "active") {
                await notifyAdmin(
                    `✅ <b>Foydalanuvchi statusi o'zgardi</b>\n<code>${beforeRow?.status ?? "—"}</code> → <b>active</b>\n\n👤 ${userLink(userData)}\n🆔 <code>${userData.tg_id}</code>`,
                );
            }
        } else {
            console.log(ctx.myChatMember.new_chat_member);
        }
    } catch (err) {
        await sendLog(`<b>onHasBlocked</b>\n<pre>${formatLogError(err)}</pre>`, {
            parse_mode: "HTML",
        });
    }
}
