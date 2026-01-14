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

    const message = "Salom! Menga instagram video havolasini yuboring";
    await ctx.reply(message);
});

bot.on("message:text", async (ctx) => {
    try {
        if (ctx.message.sender_chat?.type === "channel") return;
        if (ctx.chat.id === Number(LOG_CHANNEL_ID)) return;

        const messageURL = extractInstagramUrls(ctx.message.text)[0];

        if (!messageURL) {
            if (ctx.chat.type === "private") {
                const replyText = "Iltimos, **instagram video havolasini** yuboring ♻️";
                await ctx.reply(replyText, { parse_mode: "Markdown" });

                await ctx.forwardMessage(LOG_CHANNEL_ID);
                return;
            } else return;
        }

        await ctx.replyWithChatAction("upload_video");
        const data = await getVideo(messageURL);

        await ctx.replyWithVideo(new InputFile(data, "video.mp4"), { caption: "✅ @insta_yuklagich_bot orqali yuklab olindi" });
    } catch (err) {
        console.error(err);
        if (ctx.chat.type === "private") {
            await ctx.reply("Xatolik yuz berdi. Linkni tekshirib ko‘ring ⚠️ (Ehtimol, post shaxsiy/private bo'lishi mumkin)");
        }

        const forwardedLog = await ctx.forwardMessage(LOG_CHANNEL_ID);
        const reply_to_message_id = forwardedLog.message_id;
        if (err instanceof Error) {
            await bot.api.sendMessage(LOG_CHANNEL_ID, err.message, { reply_to_message_id });
        } else {
            await bot.api.sendMessage(LOG_CHANNEL_ID, `Xato: ${err}`, { reply_to_message_id });
        }
    }
});

bot.on("my_chat_member", async (ctx) => {
    try {
        await ctx.reply("Guruhga qo'shilganimdan xursandman! Men **instagram video havolasini** yuborilsa darxol o'sha videoni tashlab beraman. ");

        const username = `${ctx.chat.username ? `🔗 Username: @${ctx.chat.username}\n` : ""}`;
        const message = `🆕 Guruhga qo'shilish:\n\n` + `👥 Chat: ${ctx.chat.title}\n${username}🆔 ID: ${ctx.chat.id}\n` + `🤖 Bot: @insta_yuklagich_bot`;

        await bot.api.sendMessage(ADMIN_CHAT_ID, message);
    } catch (err) {
        console.error(err);
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
