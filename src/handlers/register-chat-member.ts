import { Context, type Filter } from "grammy";
import type { ChatMember } from "@grammyjs/types";
import { eq } from "drizzle-orm";

import { db, isg } from "@/db";
import { saveGroup, saveUser, userLink } from "@/services/save-user";
import { sendLog } from "@/services/log";
import type { GroupStatus, User } from "@/utils/types";

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
    if (ctx.chat.type === "group" || ctx.chat.type === "supergroup") {
        await addToGroup(ctx);
    } else if (ctx.chat.type === "private") {
        await onHasBlocked(ctx);
    }
}

export async function addToGroup(ctx: Filter<Context, "my_chat_member">) {
    try {
        const mapped = groupStatusFromChatMember(ctx.myChatMember.new_chat_member);
        const chatIdKey = String(ctx.chat.id);

        if (mapped === "left" || mapped === "kicked") {
            await db.update(isg).set({ status: mapped, updated_at: new Date() }).where(eq(isg.chat_id, chatIdKey));
            return;
        }

        await saveGroup(ctx, { status: mapped });

        const replyText = "Guruhga qo'shilganimdan xursandman! Men **instagram video havolasini** yuborilsa darxol o'sha videoni tashlab beraman";
        await ctx.reply(replyText, { parse_mode: "Markdown" });
    } catch (err) {
        console.error(err);
    }
}

export async function onHasBlocked(ctx: Filter<Context, "my_chat_member">) {
    if (ctx.chat.type !== "private") return;

    const [user] = await saveUser(ctx);
    if (!user) return;

    const userData: User = {
        tg_id: user.tg_id,
        first_name: user.first_name,
        last_name: user.last_name || null,
        username: user.username || null,
    };

    if (ctx.myChatMember.new_chat_member.status === "kicked") {
        // to-do: status "has_blocked"ga o'zgartirish

        sendLog(`⚰️ Foydalanuvchi ${userLink(userData)} uchun status o'zgartirildi: has_blocked`, { parse_mode: "HTML" });
    } else if (ctx.myChatMember.new_chat_member.status === "member") {
        // to-do: status "active"ga o'zgartirish

        sendLog(`⚰️ Foydalanuvchi ${userLink(userData)} uchun status o'zgartirildi: active`, { parse_mode: "HTML" });
    } else {
        console.log(ctx.myChatMember.new_chat_member);
    }
}
