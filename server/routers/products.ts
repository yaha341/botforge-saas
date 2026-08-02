import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getBotById, getProductsForBot, createProduct, deleteProduct, getCategoriesForBot, createCategory, deleteCategory } from "../db";

export const productsRouter = router({
  list: protectedProcedure.input(z.object({ botId: z.number() })).query(async ({ ctx, input }) => {
    const bot = await getBotById(input.botId, ctx.user.id);
    if (!bot) throw new Error("Bot not found");
    return getProductsForBot(input.botId);
  }),
  create: protectedProcedure.input(z.object({
    botId: z.number(), name: z.string().min(1), price: z.string(),
    categoryId: z.number().optional(), description: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const bot = await getBotById(input.botId, ctx.user.id);
    if (!bot) throw new Error("Bot not found");
    const id = await createProduct({ botId: input.botId, name: input.name, price: input.price, categoryId: input.categoryId, description: input.description });
    return { id };
  }),
  delete: protectedProcedure.input(z.object({ productId: z.number(), botId: z.number() })).mutation(async ({ ctx, input }) => {
    const bot = await getBotById(input.botId, ctx.user.id);
    if (!bot) throw new Error("Bot not found");
    await deleteProduct(input.productId, input.botId);
    return { success: true };
  }),
});

export const categoriesRouter = router({
  list: protectedProcedure.input(z.object({ botId: z.number() })).query(async ({ ctx, input }) => {
    const bot = await getBotById(input.botId, ctx.user.id);
    if (!bot) throw new Error("Bot not found");
    return getCategoriesForBot(input.botId);
  }),
  create: protectedProcedure.input(z.object({ botId: z.number(), name: z.string(), emoji: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const bot = await getBotById(input.botId, ctx.user.id);
    if (!bot) throw new Error("Bot not found");
    const id = await createCategory({ botId: input.botId, name: input.name, emoji: input.emoji });
    return { id };
  }),
  delete: protectedProcedure.input(z.object({ categoryId: z.number(), botId: z.number() })).mutation(async ({ ctx, input }) => {
    const bot = await getBotById(input.botId, ctx.user.id);
    if (!bot) throw new Error("Bot not found");
    await deleteCategory(input.categoryId, input.botId);
    return { success: true };
  }),
});
