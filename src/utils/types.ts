import type { ParseMode } from "@grammyjs/types";
import { Context, type CallbackQueryContext, type CommandContext } from "grammy";

export type MyContext = CommandContext<Context> | CallbackQueryContext<Context> | Context;

export interface User {
    id?: number;
    tg_id: string | number;
    first_name: string;
    last_name: string | null;
    username: string | null;
}

export type LogOptions = { parse_mode?: ParseMode; reply_to_message_id?: number };
