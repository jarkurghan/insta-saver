import { Context, type Filter } from "grammy";
import type { ChatMember } from "@grammyjs/types";
import type { GroupStatus, User } from "@/utils/types";
import { saveGroup } from "@/services/save-user";
import { saveUser } from "@/services/save-user";
import { groupLink, userLink } from "@/services/save-user";
import { sendAdmin, sendErrorLog } from "@/services/log";
import { eq } from "drizzle-orm/sql/expressions/conditions";
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
        await sendErrorLog({ ctx, event: "Chat member", error: err });
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
                const msg =
                    `♻️ Status o'zgartirildi:\n\n` +
                    `👥 Chat: ${gl}\n` +
                    `🆔 Chat ID: <code>${chat.id}</code>\n` +
                    `♻️ Eski status: ${beforeRow?.status ?? "—"}\n` +
                    `♻️ Yangi status: ${mapped}\n` +
                    `🤖 Bot: @insta_yuklagich_bot`;

                await sendAdmin(msg);
            }
            return;
        }

        const [beforeRow] = await db.select({ status: isg.status }).from(isg).where(eq(isg.chat_id, chatIdKey)).limit(1);
        await saveGroup(ctx, { status: mapped });

        if (beforeRow && beforeRow.status !== mapped) {
            const gl = groupLink({ id: chat.id, title: chat.title, username: chat.username ?? null });
            const msg =
                `♻️ Status o'zgartirildi:\n\n` +
                `👥 Chat: ${gl}\n` +
                `🆔 Chat ID: <code>${chat.id}</code>\n` +
                `♻️ Eski status: ${beforeRow?.status ?? "—"}\n` +
                `♻️ Yangi status: ${mapped}\n` +
                `🤖 Bot: @insta_yuklagich_bot`;

            await sendAdmin(msg);
        }

        const replyText = "Guruhga qo'shilganimdan xursandman! Men **instagram video havolasini** yuborilsa darxol o'sha videoni tashlab beraman";
        await ctx.reply(replyText, { parse_mode: "Markdown" });
    } catch (err) {
        await sendErrorLog({ ctx, event: "Guruhga qo'shilganda", error: err });
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
                const msg =
                    `♻️ Status o'zgartirildi:\n\n` +
                    `👤 Ism: ${userLink(userData)}\n` +
                    `🆔 User ID: <code>${tgKey}</code>\n` +
                    `♻️ Eski status: ${beforeRow?.status ?? "—"}\n` +
                    `♻️ Yangi status: has_blocked\n` +
                    `🤖 Bot: @insta_yuklagich_bot`;

                await sendAdmin(msg);
            }
        } else if (ctx.myChatMember.new_chat_member.status === "member") {
            await db.update(isu).set({ status: "active", updated_at: new Date() }).where(eq(isu.tg_id, tgKey));
            if (!beforeRow || beforeRow.status !== "active") {
                const msg =
                    `♻️ Status o'zgartirildi:\n\n` +
                    `👤 Ism: ${userLink(userData)}\n` +
                    `🆔 User ID: <code>${tgKey}</code>\n` +
                    `♻️ Eski status: ${beforeRow?.status ?? "—"}\n` +
                    `♻️ Yangi status: active\n` +
                    `🤖 Bot: @insta_yuklagich_bot`;

                await sendAdmin(msg);
            }
        } else {
            await sendErrorLog({ ctx, event: "Foydalanuvchi statusi o'zgarmadi", error: new Error("Foydalanuvchi statusi o'zgarmadi") });
        }
    } catch (err) {
        await sendErrorLog({ ctx, event: "Foydalanuvchi bloklanganda", error: err });
    }
}
