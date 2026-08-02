import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getBotById, getBotStats } from "../db";

export const analyticsRouter = router({
  getBotStats: protectedProcedure.input(z.object({ botId: z.number() })).query(async ({ ctx, input }) => {
    const bot = await getBotById(input.botId, ctx.user.id);
    if (!bot) throw new Error("Bot not found");
    return getBotStats(input.botId);
  }),
});
