import { Bot } from "grammy";
import { BOT_TOKEN } from "@/utils/constants";
import { GLOBAL_NAME_RE } from "@/utils/constants";
import { OFF_GLOBAL_COMMAND_RE } from "@/utils/constants";
import { ON_GLOBAL_COMMAND_RE } from "@/utils/constants";
import { autoRetry } from "@grammyjs/auto-retry";
import { onMessageText } from "@/handlers/on-message";
import { registerChatMember } from "@/handlers/register-chat-member";
import { registerStartCommand } from "@/handlers/register-start-command";
import { registerErrorHandler } from "@/handlers/register-error-handler";
import { onChangeGlobalNameCommand } from "@/handlers/global-commands";
import { onOffGlobalCommand } from "@/handlers/global-commands";
import { onGlobalCommand } from "@/handlers/global-commands";
import { webhookCallback } from "grammy";

if (!BOT_TOKEN) throw new Error("BOT_TOKEN topilmadi!");
export const bot = new Bot(BOT_TOKEN);

bot.api.config.use(autoRetry());

bot.command("start", registerStartCommand);

bot.hears(ON_GLOBAL_COMMAND_RE, onGlobalCommand);
bot.hears(OFF_GLOBAL_COMMAND_RE, onOffGlobalCommand);
bot.hears(GLOBAL_NAME_RE, onChangeGlobalNameCommand);

bot.on("message:text", onMessageText);
bot.on("my_chat_member", registerChatMember);

bot.catch(registerErrorHandler);

export const handleUpdate = webhookCallback(bot, "hono");
