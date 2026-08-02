import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getBotById, getSubscriptionsForUser, createSubscription, createNotification } from "../db";
import crypto from "crypto";

const PLAN_PRICES: Record<string, number> = {
  basic: 35000,
  pro: 65000,
  enterprise: 120000,
};

export const billingRouter = router({
  listSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    return getSubscriptionsForUser(ctx.user.id);
  }),

  createCheckout: protectedProcedure.input(z.object({
    botId: z.number(),
    plan: z.enum(["basic", "pro", "enterprise"]),
  })).mutation(async ({ ctx, input }) => {
    const bot = await getBotById(input.botId, ctx.user.id);
    if (!bot) throw new Error("Bot not found");

    const price = PLAN_PRICES[input.plan];
    const orderId = `sub_${ctx.user.id}_${input.botId}_${Date.now()}`;

    // Create pending subscription
    const subId = await createSubscription({
      botId: input.botId,
      ownerId: ctx.user.id,
      plan: input.plan,
      status: "pending",
      billingCycle: "annual",
      priceKzt: price.toString(),
      prodamusOrderId: orderId,
    });

    // Build Prodamus payment URL
    const prodamusShopUrl = process.env.PRODAMUS_SHOP_URL ?? "";
    const prodamusSecretKey = process.env.PRODAMUS_SECRET_KEY ?? "";

    if (!prodamusShopUrl) {
      // Return demo URL if Prodamus not configured
      return { paymentUrl: null, subscriptionId: subId, message: "Prodamus not configured. Contact support." };
    }

    const params: Record<string, string> = {
      order_id: orderId,
      customer_extra: `sub_${subId}`,
      products: JSON.stringify([{ name: `${input.plan.toUpperCase()} Plan — Annual`, price, quantity: 1 }]),
      do: "link",
    };

    // Sign the request
    const sortedParams = Object.keys(params).sort().reduce((acc, key) => ({ ...acc, [key]: params[key] }), {} as Record<string, string>);
    const signString = Object.entries(sortedParams).map(([k, v]) => `${k}=${v}`).join("&");
    const sign = crypto.createHmac("sha256", prodamusSecretKey).update(signString).digest("hex");

    const queryString = new URLSearchParams({ ...params, sign }).toString();
    const paymentUrl = `${prodamusShopUrl}?${queryString}`;

    return { paymentUrl, subscriptionId: subId };
  }),

  handleWebhook: protectedProcedure.input(z.object({
    order_id: z.string(),
    payment_status: z.string(),
    payment_id: z.string().optional(),
    customer_extra: z.string().optional(),
  })).mutation(async ({ input }) => {
    // This is called by Prodamus webhook — handled in Express route
    return { success: true };
  }),
});

