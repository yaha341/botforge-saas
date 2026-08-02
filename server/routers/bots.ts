import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getBotsForUser, getBotById, createBot, updateBotStatus, updateBotModules,
  getSettingsForBot, upsertSettings, createNotification,
} from "../db";
import axios from "axios";

async function verifyTelegramToken(token: string): Promise<{ ok: boolean; username?: string }> {
  try {
    const res = await axios.get(`https://api.telegram.org/bot${token}/getMe`, { timeout: 5000 });
    if (res.data?.ok) return { ok: true, username: res.data.result.username };
    return { ok: false };
  } catch {
    return { ok: false };
  }
}

async function setTelegramWebhook(token: string, webhookUrl: string): Promise<boolean> {
  try {
    const res = await axios.post(`https://api.telegram.org/bot${token}/setWebhook`, { url: webhookUrl }, { timeout: 5000 });
    return res.data?.ok === true;
  } catch {
    return false;
  }
}

export const botsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getBotsForUser(ctx.user.id);
  }),

  get: protectedProcedure.input(z.object({ botId: z.number() })).query(async ({ ctx, input }) => {
    const bot = await getBotById(input.botId, ctx.user.id);
    if (!bot) throw new Error("Bot not found");
    return bot;
  }),

  create: protectedProcedure.input(z.object({
    botToken: z.string().min(10),
    botName: z.string().min(1),
    moduleShop: z.boolean().optional(),
    moduleCourses: z.boolean().optional(),
    moduleBroadcasts: z.boolean().optional(),
    moduleInstagram: z.boolean().optional(),
    moduleAiAssistant: z.boolean().optional(),
    moduleReferral: z.boolean().optional(),
    moduleCoupons: z.boolean().optional(),
    moduleMultiCurrency: z.boolean().optional(),
    moduleCrmIntegration: z.boolean().optional(),
  })).mutation(async ({ ctx, input }) => {
    const tgInfo = await verifyTelegramToken(input.botToken);
    if (!tgInfo.ok) throw new Error("Invalid Telegram bot token. Please check and try again.");

    const botId = await createBot({
      ownerId: ctx.user.id,
      botToken: input.botToken,
      botName: input.botName,
      botUsername: tgInfo.username,
      moduleShop: input.moduleShop ?? false,
      moduleCourses: input.moduleCourses ?? false,
      moduleBroadcasts: input.moduleBroadcasts ?? false,
      moduleInstagram: input.moduleInstagram ?? false,
      moduleAiAssistant: input.moduleAiAssistant ?? false,
      moduleReferral: input.moduleReferral ?? false,
      moduleCoupons: input.moduleCoupons ?? false,
      moduleMultiCurrency: input.moduleMultiCurrency ?? false,
      moduleCrmIntegration: input.moduleCrmIntegration ?? false,
    });

    await createNotification({
      type: "new_bot",
      title: "New Bot Registered",
      body: `Bot "${input.botName}" (@${tgInfo.username ?? "unknown"}) was created by user #${ctx.user.id}`,
      meta: { botId, ownerId: ctx.user.id },
    });

    // Set webhook (best-effort, requires APP_PUBLIC_URL env)
    const appUrl = process.env.APP_PUBLIC_URL ?? "";
    if (appUrl) {
      const webhookUrl = `${appUrl}/api/webhook/${input.botToken}`;
      await setTelegramWebhook(input.botToken, webhookUrl);
    }

    return { id: botId };
  }),

  setStatus: protectedProcedure.input(z.object({
    botId: z.number(),
    status: z.enum(["active", "paused", "deleted"]),
  })).mutation(async ({ ctx, input }) => {
    await updateBotStatus(input.botId, ctx.user.id, input.status);
    return { success: true };
  }),

  delete: protectedProcedure.input(z.object({ botId: z.number() })).mutation(async ({ ctx, input }) => {
    await updateBotStatus(input.botId, ctx.user.id, "deleted");
    return { success: true };
  }),

  getSettings: protectedProcedure.input(z.object({ botId: z.number() })).query(async ({ ctx, input }) => {
    const bot = await getBotById(input.botId, ctx.user.id);
    if (!bot) throw new Error("Bot not found");
    return getSettingsForBot(input.botId);
  }),

  updateSettings: protectedProcedure.input(z.object({
    botId: z.number(),
    welcomeMessage: z.string().optional(),
    currency: z.string().optional(),
    language: z.string().optional(),
    adminTelegramId: z.number().optional(),
  })).mutation(async ({ ctx, input }) => {
    const bot = await getBotById(input.botId, ctx.user.id);
    if (!bot) throw new Error("Bot not found");
    await upsertSettings({
      botId: input.botId,
      welcomeMessage: input.welcomeMessage,
      currency: input.currency,
      language: input.language,
      adminTelegramId: input.adminTelegramId,
    });
    return { success: true };
  }),

  updateModules: protectedProcedure.input(z.object({
    botId: z.number(),
    modules: z.record(z.string(), z.boolean()),
  })).mutation(async ({ ctx, input }) => {
    const bot = await getBotById(input.botId, ctx.user.id);
    if (!bot) throw new Error("Bot not found");
    await updateBotModules(input.botId, ctx.user.id, input.modules);
    return { success: true };
  }),
});
