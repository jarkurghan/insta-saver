import { Context } from "grammy";
import { InputFile } from "grammy";
import { type Filter } from "grammy";
import { LOG_CHANNEL_ID } from "@/utils/constants";
import { sendErrorLog } from "@/services/log";
import { counter } from "@/services/counter";
import axios from "axios";

type MediaType = "photo" | "video";

interface MediaFile {
    data: Buffer;
    filename: string;
    type: MediaType;
}

async function getMediaFiles(messageURL: string): Promise<MediaFile[]> {
    const urlObj = new URL(messageURL);
    urlObj.hostname = "kkinstagram.com";
    urlObj.searchParams.set("utm_source", "ig_web_copy_link");

    const url = urlObj.toString().replaceAll("%3D", "=");
    const headers = { "User-Agent": "TelegramBot (like TwitterBot)" };

    const response = await axios<{ data: Buffer }>({ url, headers, method: "GET", responseType: "arraybuffer" });

    const contentType = String(response.headers["content-type"] || "");

    let type: MediaType = "video";
    if (contentType.startsWith("image/")) {
        type = "photo";
    } else if (contentType.startsWith("video/")) {
        type = "video";
    }

    const extensionFromHeader = contentType.split("/")[1]?.split(";")[0] || "";
    const extension = extensionFromHeader || (type === "photo" ? "jpg" : "mp4");

    const filename = `${type}.${extension}`;

    return [{ data: response.data as unknown as Buffer, filename, type }];
}

function extractInstagramUrls(text: string): string[] {
    if (!text) return [];

    const regex = /https?:\/\/(www\.)?instagram\.com\/[^\s]+/gi;
    return text.match(regex) || [];
}

export const onMessageText = async (ctx: Filter<Context, "message:text">) => {
    (async () => {
        try {
            if (ctx.message.sender_chat?.type === "channel") return;
            if (ctx.chat.id === Number(LOG_CHANNEL_ID)) return;

            const messageUrls = extractInstagramUrls(ctx.message.text);

            if (!messageUrls.length) {
                if (ctx.chat.type === "private") {
                    const replyText = "Iltimos, **instagram post/reel havolasini** yuboring ♻️";
                    await ctx.reply(replyText, { parse_mode: "Markdown" });

                    await ctx.forwardMessage(LOG_CHANNEL_ID);
                    return;
                } else return;
            }

            let keepSendingChatAction = true;
            const chatActionLoop = (async () => {
                const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
                while (keepSendingChatAction) {
                    await ctx.api.sendChatAction(ctx.chat.id, "upload_document").catch(() => {});
                    await delay(4000);
                }
            })();

            const allMediaFiles: MediaFile[] = [];

            for (const messageURL of messageUrls) {
                const mediaFiles = await getMediaFiles(messageURL);
                allMediaFiles.push(...mediaFiles);
            }

            if (!allMediaFiles.length) {
                throw new Error("Hech qanday media topilmadi");
            }

            const caption = "✅ @insta_yuklagich_bot orqali yuklab olindi";

            if (allMediaFiles.length === 1) {
                const file = allMediaFiles[0]!;
                const inputFile = new InputFile(file.data, file.filename);

                if (ctx.chat.type === "private") {
                    if (file.type === "photo") {
                        await ctx.replyWithPhoto(inputFile, { caption });
                    } else {
                        await ctx.replyWithVideo(inputFile, { caption });
                    }
                } else {
                    if (file.type === "photo") {
                        await ctx.replyWithPhoto(inputFile, {
                            caption,
                            reply_parameters: { message_id: ctx.message.message_id },
                        });
                    } else {
                        await ctx.replyWithVideo(inputFile, {
                            caption,
                            reply_parameters: { message_id: ctx.message.message_id },
                        });
                    }
                }

                keepSendingChatAction = false;
                await chatActionLoop.catch(() => {});
                await counter(ctx);
                return;
            }

            const mediaGroup = allMediaFiles.map((file, index) => ({
                type: file.type,
                media: new InputFile(file.data, file.filename),
                ...(index === 0 ? { caption } : {}),
            }));

            if (ctx.chat.type === "private") {
                await ctx.replyWithMediaGroup(mediaGroup as any);
            } else {
                await ctx.api.sendMediaGroup(ctx.chat.id, mediaGroup as any, {
                    reply_to_message_id: ctx.message.message_id,
                });
            }

            keepSendingChatAction = false;
            await chatActionLoop.catch(() => {});
            await counter(ctx, allMediaFiles.length);
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
    })();
};
