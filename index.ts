import { Bot } from "grammy";
import { Context } from "grammy";
import { InputFile } from "grammy";
import { webhookCallback } from "grammy";
import { type SessionFlavor } from "grammy";
import { createClient } from "@supabase/supabase-js";
import { Hono } from "hono";
import axios from "axios";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "";
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || "";
const TABLE_NAME = process.env.TABLE_NAME || "";
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID || "";

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

async function getVideo(messageURL: string) {
    const urlObj = new URL(messageURL);
    urlObj.hostname = "kkinstagram.com";
    urlObj.searchParams.set("utm_source", "ig_web_copy_link");

    const url = urlObj.toString().replaceAll("%3D", "=");
    const headers = { "User-Agent": "TelegramBot (like TwitterBot)" };
    const { data } = await axios({ url, headers, method: "GET", responseType: "arraybuffer" });
    return data;
}

function extractInstagramUrls(text: string): string[] {
    if (!text) return [];

    const regex = /https?:\/\/(www\.)?instagram\.com\/[^\s]+/gi;
    return text.match(regex) || [];
}

bot.command("start", async (ctx) => {
    const payload = ctx.match;
    const utm = payload.slice(payload.indexOf("utm-") + 4);

    await saveUser(ctx, { utm });
    const forwardedLog = await ctx.forwardMessage(LOG_CHANNEL_ID);
    const reply_to_message_id = forwardedLog.message_id;

    const message = "Salom! Menga instagram video havolasini yuboring";
    await ctx.reply(message);

    await bot.api.sendMessage(LOG_CHANNEL_ID, message, { reply_to_message_id });
});

bot.on("message:text", async (ctx) => {
    if (ctx.message.sender_chat?.type === "channel") return;
    if (ctx.chat.id === Number(LOG_CHANNEL_ID)) return;

    const forwardedLog = await ctx.forwardMessage(LOG_CHANNEL_ID);
    const reply_to_message_id = forwardedLog.message_id;

    try {
        const messageURL = extractInstagramUrls(ctx.message.text)[0];

        if (!messageURL) {
            if (ctx.chat.type === "private") {
                const replyText = "Iltimos, **instagram video havolasini** yuboring ♻️";
                await ctx.reply(replyText, { parse_mode: "Markdown" });
                await bot.api.sendMessage(LOG_CHANNEL_ID, replyText, { reply_to_message_id });
                return;
            } else return;
        }

        if (ctx.chat.type !== "private") {
            const username = `${ctx.chat.username ? `🔗 Username: @${ctx.chat.username}\n` : ""}`;
            const message = `👥 Chat: ${ctx.chat.title}\n${username}🆔 ID: ${ctx.chat.id}`;
            await bot.api.sendMessage(LOG_CHANNEL_ID, message, { reply_to_message_id });
            console.log(ctx.chat);
        }

        await ctx.replyWithChatAction("upload_video");
        const data = await getVideo(messageURL);

        const caption = "✅ @insta_yuklagich_bot orqali yuklab olindi";
        const userVideo = await ctx.replyWithVideo(new InputFile(data, "video.mp4"), { caption });

        await bot.api.sendVideo(LOG_CHANNEL_ID, userVideo.video.file_id, { caption, reply_to_message_id });
    } catch (err) {
        console.error("Download Error:", err);

        const errorMsg = "Xatolik yuz berdi. Linkni tekshirib ko‘ring ⚠️ (Ehtimol, post shaxsiy/private bo'lishi mumkin)";
        await ctx.reply(errorMsg);

        await bot.api.sendMessage(LOG_CHANNEL_ID, errorMsg, { reply_to_message_id });
    }
});

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    if (err.error instanceof Error) console.error(err.error.message);
});

app.post("/", webhookCallback(bot, "hono"));
app.get("/", (c) => c.text("Bot ishlamoqda!"));

export default app;
