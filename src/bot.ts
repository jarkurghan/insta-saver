import { Bot } from "grammy";
import { BOT_TOKEN } from "@/utils/constants";
import { autoRetry } from "@grammyjs/auto-retry";
import { onMessageText } from "@/handlers/on-message";
import { registerChatMember } from "@/handlers/register-chat-member";
import { registerStartCommand } from "@/handlers/register-start-command";
import { registerErrorHandler } from "@/handlers/register-error-handler";
import { webhookCallback } from "grammy";

if (!BOT_TOKEN) throw new Error("BOT_TOKEN topilmadi!");
export const bot = new Bot(BOT_TOKEN);

bot.api.config.use(autoRetry());

bot.command("start", registerStartCommand);
bot.on("message:text", onMessageText);
bot.on("my_chat_member", registerChatMember);

bot.catch(registerErrorHandler);

export const handleUpdate = webhookCallback(bot, "hono");

// export function startBot() {
//     return bot.start();
// }
