import { Bot, Context } from "grammy";
const ig = require("instagram-url-direct");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

const bot = new Bot<Context>(BOT_TOKEN);

bot.command("start", (ctx) => {
    ctx.reply("Salom! Menga Instagram video havolasini yuboring");
});

bot.on("message:text", async (ctx) => {
    const url = ctx.message.text;

    if (!url.includes("instagram.com")) {
        return ctx.reply("Iltimos, **Instagram video havolasini** yuboring ♻️", { parse_mode: "Markdown" });
    }

    const processingMessage = await ctx.reply("Video tayyorlanmoqda... ⏳");
    await ctx.replyWithChatAction("upload_video");

    try {
        const result = await ig.instagramGetUrl(url);

        if (result.url_list && result.url_list.length > 0) {
            const videoUrl = result.url_list[0];

            await ctx.replyWithVideo(videoUrl, { caption: "✅ @insta_yuklagich_bot orqali yuklab olindi" });

            await ctx.api.deleteMessage(ctx.chat.id, processingMessage.message_id);
        } else {
            await ctx.api.deleteMessage(ctx.chat.id, processingMessage.message_id);
            ctx.reply("Videoni topib bo‘lmadi ❌");
        }
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
