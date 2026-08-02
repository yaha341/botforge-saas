import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getBotById, getIgAccountsForBot, deleteIgAccount, getIgRulesForBot, createIgRule, deleteIgRule } from "../db";

export const instagramRouter = router({
  listAccounts: protectedProcedure.input(z.object({ botId: z.number() })).query(async ({ ctx, input }) => {
    const bot = await getBotById(input.botId, ctx.user.id);
    if (!bot) throw new Error("Bot not found");
    return getIgAccountsForBot(input.botId);
  }),
  disconnect: protectedProcedure.input(z.object({ accountId: z.number(), botId: z.number() })).mutation(async ({ ctx, input }) => {
    const bot = await getBotById(input.botId, ctx.user.id);
    if (!bot) throw new Error("Bot not found");
    await deleteIgAccount(input.accountId, input.botId);
    return { success: true };
  }),
  listRules: protectedProcedure.input(z.object({ botId: z.number() })).query(async ({ ctx, input }) => {
    const bot = await getBotById(input.botId, ctx.user.id);
    if (!bot) throw new Error("Bot not found");
    return getIgRulesForBot(input.botId);
  }),
  createRule: protectedProcedure.input(z.object({
    botId: z.number(), igAccountId: z.number(), keyword: z.string().min(1),
    dmMessage: z.string().min(1), postId: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const bot = await getBotById(input.botId, ctx.user.id);
    if (!bot) throw new Error("Bot not found");
    const id = await createIgRule({ botId: input.botId, igAccountId: input.igAccountId, keyword: input.keyword, dmMessage: input.dmMessage, postId: input.postId });
    return { id };
  }),
  deleteRule: protectedProcedure.input(z.object({ ruleId: z.number(), botId: z.number() })).mutation(async ({ ctx, input }) => {
    const bot = await getBotById(input.botId, ctx.user.id);
    if (!bot) throw new Error("Bot not found");
    await deleteIgRule(input.ruleId, input.botId);
    return { success: true };
  }),
});
