import { Hono } from "hono";
import { handleUpdate } from "@/bot";
import { logger } from "hono/logger";
import { bot } from "@/bot";

const app = new Hono();

app.use("*", logger());

app.get("/", (c) => c.text("Hello Hono!"));
app.post("/bot", handleUpdate);

export default app;

// bot.start({ onStart: (bot) => console.log(`Bot started as https://t.me/${bot.username}`) });
