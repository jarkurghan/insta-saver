import type { CommandContext } from "grammy";
import { saveUser } from "@/services/save-user";
import { sendErrorLog } from "@/services/log";
import { Context } from "grammy";

export async function registerStartCommand(ctx: CommandContext<Context>) {
    try {
        const payload = ctx.match;
        const utm = payload.slice(payload.indexOf("utm-") + 4);

        await saveUser(ctx, { utm });

        const message = "Salom! Menga instagram video havolasini yuboring";
        await ctx.reply(message);
    } catch (err) {
        await sendErrorLog({ ctx, event: "start bosganda", error: err });
    }
}
