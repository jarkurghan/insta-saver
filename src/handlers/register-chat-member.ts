import { Context, type Filter } from "grammy";
import { ADMIN_CHAT_ID } from "@/utils/constants";
import { saveUser, userLink } from "@/services/save-user";
import type { User } from "@/utils/types";
import { sendLog } from "@/services/log";
import { bot } from "@/bot";

export async function registerChatMember(ctx: Filter<Context, "my_chat_member">) {
    if (ctx.chat.type === "group" || ctx.chat.type === "supergroup") {
        await addToGroup(ctx);
    } else if (ctx.chat.type === "private") {
        await onHasBlocked(ctx);
    }
}

export async function addToGroup(ctx: Filter<Context, "my_chat_member">) {
    try {
        const replyText = "Guruhga qo'shilganimdan xursandman! Men **instagram video havolasini** yuborilsa darxol o'sha videoni tashlab beraman";
        await ctx.reply(replyText, { parse_mode: "Markdown" });

        const username = `${ctx.chat.username ? `🔗 Username: @${ctx.chat.username}\n` : ""}`;
        const message = `🆕 Guruhga qo'shilish:\n\n` + `👥 Chat: ${ctx.chat.title}\n${username}🆔 ID: ${ctx.chat.id}\n` + `🤖 Bot: @insta_yuklagich_bot`;

        await bot.api.sendMessage(ADMIN_CHAT_ID, message);
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
