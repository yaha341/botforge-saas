import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getBotById, getOrdersForBot } from "../db";

export const ordersRouter = router({
  list: protectedProcedure.input(z.object({ botId: z.number() })).query(async ({ ctx, input }) => {
    const bot = await getBotById(input.botId, ctx.user.id);
    if (!bot) throw new Error("Bot not found");
    return getOrdersForBot(input.botId);
  }),
});
