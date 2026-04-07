import type { Context } from "grammy";
import { saveGroup } from "@/services/save-user";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { isg } from "@/db/schema";
import { db } from "@/db";

const statMessage = "\n\nBot statistikasini quyidagi manzilda ko'rishingiz mumkin:\nhttps://monitor.jarkurghan.uz/insta-saver-bot";

async function ensureGroupRow(ctx: Context): Promise<string | null> {
    const chat = ctx.chat;
    if (!chat || (chat.type !== "group" && chat.type !== "supergroup")) return null;

    await saveGroup(ctx, { status: "active" });
    return String(chat.id);
}

export async function onGlobalCommand(ctx: Context) {
    const chatIdKey = await ensureGroupRow(ctx);
    if (!chatIdKey) return;

    await db.update(isg).set({ is_global: true, updated_at: new Date() }).where(eq(isg.chat_id, chatIdKey));

    const message_id = ctx.message?.message_id;
    const link_preview_options = { is_disabled: true };
    const reply_parameters = message_id ? { reply_parameters: { message_id }, link_preview_options } : { link_preview_options };
    await ctx.reply(`✅ Statistika uchun globallik rejimi yoqildi.${statMessage}`, reply_parameters);
}

export async function onOffGlobalCommand(ctx: Context) {
    const chatIdKey = await ensureGroupRow(ctx);
    if (!chatIdKey) return;

    await db.update(isg).set({ is_global: false, updated_at: new Date() }).where(eq(isg.chat_id, chatIdKey));

    const message_id = ctx.message?.message_id;
    await ctx.reply("✅ Globallik rejimi o‘chirildi. Endi guruh statistikada ko'rinmaydi", message_id ? { reply_parameters: { message_id } } : undefined);
}

export async function onChangeGlobalNameCommand(ctx: Context) {
    const chatIdKey = await ensureGroupRow(ctx);
    if (!chatIdKey) return;

    const name = String((ctx as any).match?.[2] ?? "").trim();
    if (!name) {
        const message_id = ctx.message?.message_id;
        const reply_parameters = message_id ? { reply_parameters: { message_id } } : {};
        const chatTitle = ctx.chat && "title" in ctx.chat && ctx.chat.title ? ctx.chat.title : "";
        const groupName = chatTitle || "[guruh nomi]";
        const msg =
            `⚠️ Foydalanish: \`/change_global_name ${groupName}\`\n${groupName} o'rniga istalgan nomni yozishingiz mumkin` +
            `\n\n💡 Ushbu nom statistika uchun guruhning global nomi sifatida ishlatiladi.`;
        await ctx.reply(msg, { parse_mode: "Markdown", ...reply_parameters });
        return;
    }

    await db.update(isg).set({ global_name: name, updated_at: new Date() }).where(eq(isg.chat_id, chatIdKey));

    const message_id = ctx.message?.message_id;
    const link_preview_options = { is_disabled: true };
    const reply_parameters = message_id ? { reply_parameters: { message_id }, link_preview_options } : { link_preview_options };
    await ctx.reply(`✅ Global nom yangilandi: **${name}**${statMessage}`, { parse_mode: "Markdown", ...reply_parameters });
}
