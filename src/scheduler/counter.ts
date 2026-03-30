import { isg, isu } from "@/db/schema";
import { formatLogError } from "@/services/log";
import { sendLog } from "@/services/log";
import { sql } from "@/db";
import { db } from "@/db";

const resetTodayCounters = async () => {
    await db.update(isu).set({ today_count: 0 });
    await db.update(isg).set({ today_count: 0 });
};

async function main() {
    try {
        await resetTodayCounters();
        await sql.end({ timeout: 5 });
    } catch (err) {
        await sendLog(`<b>scheduler/counter</b>\n<pre>${formatLogError(err)}</pre>`, { parse_mode: "HTML" });
        try {
            await sql.end({ timeout: 5 });
        } catch (err) {
            console.log(err);
        }
        process.exit(1);
    }
}

void main();
