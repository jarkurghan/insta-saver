export const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
export const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || "";
export const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID || "";
export const DB_HOST = process.env.DB_HOST || "";
export const DB_PORT = process.env.DB_PORT || "";
export const DB_USER = process.env.DB_USER || "";
export const DB_PASSWORD = process.env.DB_PASSWORD || "";
export const DB_NAME = process.env.DB_NAME || "";

export const ON_GLOBAL_COMMAND_RE = /^\/on_global(@\w+)?$/;
export const OFF_GLOBAL_COMMAND_RE = /^\/off_global(@\w+)?$/;
export const GLOBAL_NAME_RE = /^\/change_global_name(@\w+)?(?:\s+([\s\S]+))?$/;