import type { CommandContext } from "grammy";
import { saveUser } from "@/services/save-user";
import { Context } from "grammy";

export async function registerStartCommand(ctx: CommandContext<Context>) {
    const payload = ctx.match;
    const utm = payload.slice(payload.indexOf("utm-") + 4);

    await saveUser(ctx, { utm });

    const message = "Salom! Menga instagram video havolasini yuboring";
    await ctx.reply(message);
}
