import type { Express, Request, Response } from "express";
import crypto from "crypto";
import { getDb } from "./db";
import { subscriptions, bots } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { createNotification } from "./db";

function verifyProdamusSign(params: Record<string, string>, secretKey: string): boolean {
  const { sign, ...rest } = params;
  if (!sign) return false;
  const sortedParams = Object.keys(rest).sort().reduce((acc, key) => ({ ...acc, [key]: rest[key] }), {} as Record<string, string>);
  const signString = Object.entries(sortedParams).map(([k, v]) => `${k}=${v}`).join("&");
  const expected = crypto.createHmac("sha256", secretKey).update(signString).digest("hex");
  return expected === sign;
}

export function registerProdamusWebhook(app: Express) {
  app.post("/api/prodamus/webhook", async (req: Request, res: Response) => {
    try {
      const secretKey = process.env.PRODAMUS_SECRET_KEY ?? "";
      const params = req.body as Record<string, string>;

      // Verify signature if secret key is configured
      if (secretKey && !verifyProdamusSign(params, secretKey)) {
        console.warn("[Prodamus] Invalid signature");
        res.status(400).json({ error: "Invalid signature" });
        return;
      }

      const { order_id, payment_status, payment_id } = params;

      if (payment_status !== "success") {
        res.json({ ok: true });
        return;
      }

      const db = await getDb();
      if (!db) { res.json({ ok: true }); return; }

      // Find subscription by order_id
      const subs = await db.select().from(subscriptions).where(eq(subscriptions.prodamusOrderId, order_id)).limit(1);
      const sub = subs[0];
      if (!sub) {
        console.warn("[Prodamus] Subscription not found for order:", order_id);
        res.json({ ok: true });
        return;
      }

      // Activate subscription — 1 year from now
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      await db.update(subscriptions).set({
        status: "active",
        prodamusPaymentId: payment_id ?? null,
        startsAt: new Date(),
        expiresAt,
      }).where(eq(subscriptions.id, sub.id));

      // Unlock ALL modules — Trading plan = full functionality
      await db.update(bots).set({
        moduleShop: true,
        moduleCourses: true,
        moduleBroadcasts: true,
        moduleInstagram: true,
        moduleAiAssistant: true,
        moduleReferral: true,
        moduleCoupons: true,
        moduleMultiCurrency: true,
        moduleCrmIntegration: true,
      }).where(eq(bots.id, sub.botId));

      // Notify owner
      await createNotification({
        type: "subscription_purchased",
        title: "Оплата получена",
        body: `Trading план активирован для бота #${sub.botId}. Оплата: ${payment_id}`,
        meta: { subscriptionId: sub.id, botId: sub.botId, plan: sub.plan },
      });

      console.log(`[Prodamus] Trading subscription #${sub.id} activated for bot #${sub.botId}`);
      res.json({ ok: true });
    } catch (err) {
      console.error("[Prodamus] Webhook error:", err);
      res.status(500).json({ error: "Internal error" });
    }
  });
}
