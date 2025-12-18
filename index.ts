import { Bot, Context, InputFile } from "grammy";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import path from "path";
import fs from "fs/promises";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

const bot = new Bot<Context>(BOT_TOKEN);

bot.command("start", (ctx) => {
    ctx.reply("Salom! Menga Instagram video havolasini yuboring");
});

bot.on("message:text", async (ctx) => {
    if (!ctx.message.text.includes("instagram.com")) {
        return ctx.reply("Iltimos, **Instagram video havolasini** yuboring ♻️", { parse_mode: "Markdown" });
    }

    const processingMessage = await ctx.reply("Video tayyorlanmoqda... ⏳");
    await ctx.replyWithChatAction("upload_video");

    try {
        const fileName = `${uuidv4()}.mp4`;
        const filePath = path.join(process.cwd(), "videos", fileName);

        const urlObj = new URL(ctx.message.text);
        urlObj.hostname = "kkinstagram.com";
        urlObj.searchParams.set("utm_source", "ig_web_copy_link");

        const url = urlObj.toString().replaceAll("%3D", "=");
        const headers = { "User-Agent": "TelegramBot (like TwitterBot)" };
        const { data } = await axios({ url, headers, method: "GET", responseType: "arraybuffer" });

        await fs.writeFile(filePath, data);
        await ctx.replyWithVideo(new InputFile(filePath), { caption: "✅ @insta_yuklagich_bot orqali yuklab olindi" });
        await ctx.api.deleteMessage(ctx.chat.id, processingMessage.message_id);
        await fs.unlink(filePath);
    } catch (err) {
        await ctx.api.deleteMessage(ctx.chat.id, processingMessage.message_id);
        console.error("Download Error:", err);
        ctx.reply("Xatolik yuz berdi. Linkni tekshirib ko‘ring ⚠️ (Ehtimol, post shaxsiy/private bo'lishi mumkin)");
    }
});

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    if (err.error instanceof Error) console.error(err.error.message);
});

bot.start({ onStart: () => console.log("🤖 Bot ishga tushdi...") });
