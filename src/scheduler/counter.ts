import { isu } from "../db/schema";
import { sql } from "../db";
import { db } from "../db";

const resetTodayCounters = async () => {
    await db.update(isu).set({ today_count: 0 });
};

async function main() {
    try {
        await resetTodayCounters();
        await sql.end({ timeout: 5 });
    } catch (err) {
        console.error(err);
        try {
            await sql.end({ timeout: 5 });
        } finally {
            process.exit(1);
        }
    }
}

main();
