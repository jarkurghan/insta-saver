import { Hono } from "hono";
import { handleUpdate } from "./bot";
import { logger } from "hono/logger";

const app = new Hono();

app.use("*", logger());

app.get("/", (c) => c.text("Hello Hono!"));
app.post("/bot", (c) => {
    void handleUpdate(c).catch((err) => console.error("System error: ", err));
    return c.text("OK");
});

export default app;

// import "@/db";
// import { startBot } from "@/bot";

// startBot();
