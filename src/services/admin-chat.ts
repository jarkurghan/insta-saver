import { bot } from "@/bot";
import { ADMIN_CHAT_ID } from "@/utils/constants";

/** Biznes-qaydlar: yangi user/guruh, status o‘zgarishi — faqat admin chat (LOG_CHANNEL emas). */
export async function notifyAdmin(message: string, parse_mode: "HTML" | "Markdown" = "HTML"): Promise<void> {
    if (!ADMIN_CHAT_ID) return;
    try {
        await bot.api.sendMessage(ADMIN_CHAT_ID, message, { parse_mode });
    } catch (err) {
        console.error("notifyAdmin xatosi:", err);
    }
}
