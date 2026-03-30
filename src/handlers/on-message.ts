import { Context } from "grammy";
import { InputFile } from "grammy";
import { type Filter } from "grammy";
import { LOG_CHANNEL_ID } from "@/utils/constants";
import { sendErrorLog } from "@/services/log";
import { counter } from "@/services/counter";
import axios from "axios";

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

export const onMessageText = async (ctx: Filter<Context, "message:text">) => {
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

        // to-do: photo and list support

        await ctx.replyWithChatAction("upload_video");
        const data = await getVideo(messageURL);

        const caption = "✅ @insta_yuklagich_bot orqali yuklab olindi";
        if (ctx.chat.type === "private") {
            await ctx.replyWithVideo(new InputFile(data, "video.mp4"), { caption });
            await counter(ctx);
        } else {
            await ctx.replyWithVideo(new InputFile(data, "video.mp4"), {
                caption,
                reply_parameters: { message_id: ctx.message.message_id },
            });
            await counter(ctx);
        }
    } catch (err) {
        try {
            const forwardedLog = await ctx.forwardMessage(LOG_CHANNEL_ID);
            const reply_to_message_id = forwardedLog.message_id;

            await sendErrorLog({ ctx, event: "Xabar kelganda", error: err, reply_to_message_id });

            if (ctx.chat.type === "private") {
                await ctx
                    .reply("Xatolik yuz berdi. Linkni tekshirib ko‘ring ⚠️ (Ehtimol, post shaxsiy/private bo'lishi mumkin)")
                    .catch(async (error) => await sendErrorLog({ ctx, event: "Javob yuborishda", error, reply_to_message_id }));
            }
        } catch (inner) {
            console.log("System error:", inner);
        }
    }
};
