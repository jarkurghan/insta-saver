import type { ParseMode } from "@grammyjs/types";
import { Context, type CallbackQueryContext, type CommandContext } from "grammy";

export type MyContext = CommandContext<Context> | CallbackQueryContext<Context> | Context;

export interface User {
    id?: number;
    tg_id: string | number;
    first_name: string;
    last_name: string | null;
    username: string | null;
    today_count?: number;
    total_count?: number;
    status?: UserStatus;
}

export const USER_STATUSES = ["active", "deleted_account", "has_blocked", "other"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const GROUP_STATUSES = ["active", "left", "kicked", "other"] as const;
export type GroupStatus = (typeof GROUP_STATUSES)[number];

export interface Group {
    id?: number;
    chat_id: string | number;
    chat_name: string | null;
    chat_username: string | null;
    added_by_username?: string | null;
    added_by_tg_id?: string | null;
    added_by_full_name?: string | null;
    today_count?: number;
    total_count?: number;
    status?: GroupStatus;
}

export type LogOptions = { parse_mode?: ParseMode; reply_to_message_id?: number };
export type ErrorLogOptions = { ctx?: Context; event: string; error: unknown; reply_to_message_id?: number; parse_mode?: ParseMode };
