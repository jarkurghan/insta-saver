import type { CommandContext } from "grammy";
import { saveUser } from "@/services/save-user";
import { Context } from "grammy";
import { formatLogError, sendLog } from "@/services/log";

export async function registerStartCommand(ctx: CommandContext<Context>) {
    try {
        const payload = ctx.match;
        const utm = payload.slice(payload.indexOf("utm-") + 4);

        await saveUser(ctx, { utm });

        const message = "Salom! Menga instagram video havolasini yuboring";
        await ctx.reply(message);
    } catch (err) {
        await sendLog(`<b>registerStartCommand</b>\n<pre>${formatLogError(err)}</pre>`, {
            parse_mode: "HTML",
        });
    }
}
