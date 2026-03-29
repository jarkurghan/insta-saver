// import { Hono } from "hono";
// import { handleUpdate } from "./bot";

// const app = new Hono();

// app.post("/bot", async (c) => await handleUpdate(c));
// app.get("/", (c) => c.text("Hello Hono!"));

// export default app;

import "@/db";
import { startBot } from "@/bot";
import { formatLogError, sendLog } from "@/services/log";

async function run() {
    try {
        await startBot();
    } catch (err) {
        await sendLog(`<b>Bot ishga tushirishda xato</b>\n<pre>${formatLogError(err)}</pre>`, {
            parse_mode: "HTML",
        });
        process.exit(1);
    }
}

void run();
