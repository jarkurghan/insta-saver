import { Bot } from "grammy";
import { Context } from "grammy";
import { InputFile } from "grammy";
import { webhookCallback } from "grammy";
import { type SessionFlavor } from "grammy";
import { createClient } from "@supabase/supabase-js";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import axios from "axios";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "";
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || "";
const TABLE_NAME = process.env.TABLE_NAME || "";

type SessionData = { counter: number };
type MyContext = Context & SessionFlavor<SessionData>;
interface User {
    id?: number;
    tg_id: string | number;
    first_name: string;
    last_name: string | null;
    username: string | null;
}

const app = new Hono();
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const bot = new Bot<MyContext>(BOT_TOKEN);

async function saveUser(ctx: Context, prop: { utm?: string }) {
    try {
        const user = ctx.from;
        if (!user) return [];

        const userData: User = {
            tg_id: user.id,
            first_name: user.first_name,
            last_name: user.last_name || null,
            username: user.username || null,
        };

        const { data } = await supabase.from(TABLE_NAME).select("tg_id").eq("tg_id", userData.tg_id).maybeSingle();
        if (!data) {
            const utm = prop.utm || "-";
            await bot.api.sendMessage(
                ADMIN_CHAT_ID,
                `🆕 Yangi foydalanuvchi:\n\n` +
                    `👤 Ism: ${user.first_name || "Noma'lum"} ${user.last_name || ""}\n` +
                    `🔗 Username: ${user.username ? `@${user.username}` : "Noma'lum"}\n` +
                    `🆔 ID: ${user.id}\n` +
                    `🚪 UTM Source: ${utm}\n` +
                    `🤖 Bot: @insta_yuklagich_bot`
            );
        }

        const { error } = await supabase.from(TABLE_NAME).upsert(userData, { onConflict: "tg_id" }).select("*");
        if (error) console.error("Supabasega saqlashda xato:", error);
    } catch (err) {
        console.error(err);
    }
}

bot.command("start", async (ctx) => {
    const payload = ctx.match;
    const utm = payload.slice(payload.indexOf("utm-") + 4);

    await saveUser(ctx, { utm });

    await ctx.reply("Salom! Menga Instagram video havolasini yuboring");
});

bot.on("message:text", async (ctx) => {
    if (!ctx.message.text.includes("instagram.com")) {
        return ctx.reply("Iltimos, **Instagram video havolasini** yuboring ♻️", { parse_mode: "Markdown" });
    }

    const processingMessage = await ctx.reply("Video tayyorlanmoqda... ⏳");
    await ctx.replyWithChatAction("upload_video");

    try {
        const urlObj = new URL(ctx.message.text);
        urlObj.hostname = "kkinstagram.com";
        urlObj.searchParams.set("utm_source", "ig_web_copy_link");

        const url = urlObj.toString().replaceAll("%3D", "=");
        const headers = { "User-Agent": "TelegramBot (like TwitterBot)" };
        const { data } = await axios({ url, headers, method: "GET", responseType: "arraybuffer" });

        await ctx.replyWithVideo(new InputFile(data, "video.mp4"), { caption: "✅ @insta_yuklagich_bot orqali yuklab olindi", supports_streaming: true });
        await ctx.api.deleteMessage(ctx.chat.id, processingMessage.message_id);
    } catch (err) {
        await ctx.api.deleteMessage(ctx.chat.id, processingMessage.message_id);
        console.error("Download Error:", err);
        await ctx.reply("Xatolik yuz berdi. Linkni tekshirib ko‘ring ⚠️ (Ehtimol, post shaxsiy/private bo'lishi mumkin)");
    }
});

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    if (err.error instanceof Error) console.error(err.error.message);
});

app.post("/", webhookCallback(bot, "hono"));
app.get("/", (c) => c.text("Bot ishlamoqda!"));

serve({ fetch: app.fetch, port: 3000 });
export default app;
