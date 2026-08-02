import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getBotById, getBroadcastsForBot, createBroadcast, sendBroadcast } from "../db";

export const broadcastsRouter = router({
  list: protectedProcedure.input(z.object({ botId: z.number() })).query(async ({ ctx, input }) => {
    const bot = await getBotById(input.botId, ctx.user.id);
    if (!bot) throw new Error("Bot not found");
    return getBroadcastsForBot(input.botId);
  }),
  create: protectedProcedure.input(z.object({
    botId: z.number(), title: z.string().min(1), message: z.string().min(1),
    scheduledAt: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const bot = await getBotById(input.botId, ctx.user.id);
    if (!bot) throw new Error("Bot not found");
    const status = input.scheduledAt ? "scheduled" : "draft";
    const id = await createBroadcast({
      botId: input.botId, title: input.title, message: input.message, status,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
    });
    return { id };
  }),
  send: protectedProcedure.input(z.object({ broadcastId: z.number(), botId: z.number() })).mutation(async ({ ctx, input }) => {
    const bot = await getBotById(input.botId, ctx.user.id);
    if (!bot) throw new Error("Bot not found");
    await sendBroadcast(input.broadcastId, input.botId);
    return { success: true };
  }),
});
