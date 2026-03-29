import { db } from "@/db";
import { eq } from "drizzle-orm";
import { isg, isu } from "@/db/schema";
import { saveGroup, saveUser } from "./save-user";
import type { Context } from "grammy";

export const counter = async (ctx: Context) => {
    const chat = ctx.chat;
    if (!chat) return;

    if (chat.type === "private") {
        const tg_id = ctx.from?.id;
        if (!tg_id) return;

        const whereCondition = eq(isu.tg_id, String(tg_id));
        const [user] = await db.select().from(isu).where(whereCondition).limit(1);

        if (user) {
            let { total_count, today_count } = user;

            today_count++;
            total_count++;

            const userData = { today_count, total_count };
            await db.update(isu).set(userData).where(whereCondition);
        } else {
            await saveUser(ctx, { today_count: 1, total_count: 1 });
        }
    } else if (chat.type === "group" || chat.type === "supergroup") {
        const chatId = String(chat.id);
        const whereCondition = eq(isg.chat_id, chatId);
        const [group] = await db.select().from(isg).where(whereCondition).limit(1);

        if (group?.status === "active") {
            await db
                .update(isg)
                .set({ today_count: group.today_count + 1, total_count: group.total_count + 1 })
                .where(whereCondition);
        } else if (!group) {
            await saveGroup(ctx, { today_count: 1, total_count: 1, status: "active" });
        }
    }
};
