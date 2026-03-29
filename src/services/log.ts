import type { LogOptions } from "@/utils/types";
import { LOG_CHANNEL_ID } from "@/utils/constants";
import { bot } from "@/bot";

function escapeForTelegramHtml(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** HTML <pre> ichida xavfsiz ko‘rsatish uchun */
export function formatLogError(err: unknown): string {
    if (err instanceof Error) {
        const text = err.stack || err.message;
        return escapeForTelegramHtml(text);
    }
    return escapeForTelegramHtml(String(err));
}

export const sendLog = async (message: string, options?: LogOptions): Promise<void> => {
    try {
        const { parse_mode = "HTML", reply_to_message_id } = options || {};

        if (reply_to_message_id) {
            await bot.api.sendMessage(LOG_CHANNEL_ID, message, {
                parse_mode: parse_mode,
                reply_parameters: { message_id: reply_to_message_id },
            });
        } else {
            await bot.api.sendMessage(LOG_CHANNEL_ID, message, {
                parse_mode: parse_mode,
            });
        }
    } catch (error) {
        console.error("sendLog xatosi:", error);
    }
};
