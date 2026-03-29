import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, sql } from "./index";

async function runMigrate() {
    try {
        await migrate(db, { migrationsFolder: "drizzle" });
    } catch (err) {
        console.error(err);
        try {
            const { formatLogError, sendLog } = await import("@/services/log");
            await sendLog(`<b>db:migrate</b>\n<pre>${formatLogError(err)}</pre>`, { parse_mode: "HTML" });
        } catch {
            /* sendLog mavjud bo‘lmasa (masalan, BOT_TOKEN yo‘q) */
        }
        process.exitCode = 1;
        return;
    }

    try {
        await sql.end({ timeout: 5 });
    } catch (err) {
        console.error(err);
        try {
            const { formatLogError, sendLog } = await import("@/services/log");
            await sendLog(`<b>db:migrate (sql.end)</b>\n<pre>${formatLogError(err)}</pre>`, {
                parse_mode: "HTML",
            });
        } catch {
            /* */
        }
        process.exitCode = 1;
    }
}

void runMigrate();
