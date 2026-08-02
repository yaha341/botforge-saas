import { getDb } from "./db";
import { broadcasts, broadcastRecipients, bots, igAccounts, igRules } from "../drizzle/schema";
import { eq, and, lte, sql } from "drizzle-orm";
import axios from "axios";

const BATCH_SIZE = 25; // Telegram rate limit: ~30 msg/sec
const BATCH_DELAY_MS = 1000;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Broadcast Processor ─────────────────────────────────────────────────────
async function processBroadcasts() {
  const db = await getDb();
  if (!db) return;

  try {
    // Find broadcasts that are scheduled and due, or in "sending" state
    const now = new Date();
    const pendingBroadcasts = await db.select().from(broadcasts).where(
      sql`(${broadcasts.status} = 'scheduled' AND ${broadcasts.scheduledAt} <= ${now}) OR ${broadcasts.status} = 'sending'`
    ).limit(5);

    for (const broadcast of pendingBroadcasts) {
      // Get bot token
      const botRows = await db.select().from(bots).where(eq(bots.id, broadcast.botId)).limit(1);
      const bot = botRows[0];
      if (!bot) continue;

      // Get pending recipients
      const recipients = await db.select().from(broadcastRecipients).where(
        and(eq(broadcastRecipients.broadcastId, broadcast.id), eq(broadcastRecipients.status, "pending"))
      ).limit(BATCH_SIZE);

      if (recipients.length === 0) {
        // All sent — mark as completed
        await db.update(broadcasts).set({ status: "sent", sentAt: new Date() }).where(eq(broadcasts.id, broadcast.id));
        console.log(`[Cron] Broadcast #${broadcast.id} completed`);
        continue;
      }

      // Send batch
      let sent = 0;
      for (const recipient of recipients) {
        try {
          await axios.post(`https://api.telegram.org/bot${bot.botToken}/sendMessage`, {
            chat_id: recipient.telegramId,
            text: broadcast.message,
            parse_mode: "HTML",
          }, { timeout: 5000 });
          await db.update(broadcastRecipients).set({ status: "sent", sentAt: new Date() }).where(eq(broadcastRecipients.id, recipient.id));
          sent++;
        } catch {
          await db.update(broadcastRecipients).set({ status: "failed" }).where(eq(broadcastRecipients.id, recipient.id));
        }
      }

      // Update sent count
      await db.update(broadcasts).set({
        status: "sending",
        sentCount: sql`${broadcasts.sentCount} + ${sent}`,
      }).where(eq(broadcasts.id, broadcast.id));

      await sleep(BATCH_DELAY_MS);
    }
  } catch (err) {
    console.error("[Cron] Broadcast processor error:", err);
  }
}

// ─── Instagram Comment Poller ─────────────────────────────────────────────────
async function pollInstagramComments() {
  const db = await getDb();
  if (!db) return;

  try {
    const accounts = await db.select().from(igAccounts).limit(20);
    const ZERNIO_API_KEY = process.env.ZERNIO_API_KEY ?? "sk_56e035fc200bc47530f01ad7c264fb04a94ab7ab4c3c3faff292f8371a98adbf";

    for (const account of accounts) {
      try {
        // Get rules for this account
        const rules = await db.select().from(igRules).where(
          and(eq(igRules.botId, account.botId), eq(igRules.igAccountId, account.id), eq(igRules.isActive, true))
        );
        if (rules.length === 0) continue;

        // Poll comments via Zernio
        const res = await axios.get(`https://api.zernio.com/v1/comments`, {
          headers: { Authorization: `Bearer ${ZERNIO_API_KEY}` },
          params: { ig_user_id: account.igAccountId, access_token: account.accessToken },
          timeout: 10000,
        });

        const comments = res.data?.comments ?? [];
        for (const comment of comments) {
          for (const rule of rules) {
            if (comment.text?.toLowerCase().includes(rule.keyword.toLowerCase())) {
              // Send DM via Zernio
              await axios.post(`https://api.zernio.com/v1/dm/send`, {
                ig_user_id: account.igAccountId,
                access_token: account.accessToken,
                recipient_id: comment.from?.id,
                message: rule.dmMessage,
              }, {
                headers: { Authorization: `Bearer ${ZERNIO_API_KEY}` },
                timeout: 10000,
              });
              // Update rule stats
              await db.update(igRules).set({ triggeredCount: sql`${igRules.triggeredCount} + 1` }).where(eq(igRules.id, rule.id));
            }
          }
        }
      } catch (err) {
        console.error(`[Cron] IG poll error for account #${account.id}:`, err);
      }
    }
  } catch (err) {
    console.error("[Cron] Instagram poller error:", err);
  }
}

// ─── Webhook Health Check ─────────────────────────────────────────────────────
async function checkWebhookHealth() {
  const db = await getDb();
  if (!db) return;

  const appUrl = process.env.APP_PUBLIC_URL ?? "";
  if (!appUrl) return;

  try {
    const activeBots = await db.select().from(bots).where(eq(bots.status, "active")).limit(50);
    for (const bot of activeBots) {
      try {
        const res = await axios.get(`https://api.telegram.org/bot${bot.botToken}/getWebhookInfo`, { timeout: 5000 });
        const webhookUrl = res.data?.result?.url;
        const expectedUrl = `${appUrl}/api/webhook/${bot.botToken}`;
        if (!webhookUrl || webhookUrl !== expectedUrl) {
          // Re-register webhook
          await axios.post(`https://api.telegram.org/bot${bot.botToken}/setWebhook`, { url: expectedUrl }, { timeout: 5000 });
          console.log(`[Cron] Re-registered webhook for bot #${bot.id}`);
        }
      } catch {
        // Skip individual bot errors
      }
    }
  } catch (err) {
    console.error("[Cron] Webhook health check error:", err);
  }
}

// ─── Scheduler ────────────────────────────────────────────────────────────────
export function startCronJobs() {
  console.log("[Cron] Starting scheduled jobs...");

  // Process broadcasts every 30 seconds
  setInterval(processBroadcasts, 30 * 1000);

  // Poll Instagram comments every 5 minutes
  setInterval(pollInstagramComments, 5 * 60 * 1000);

  // Webhook health check every 30 minutes
  setInterval(checkWebhookHealth, 30 * 60 * 1000);

  // Run immediately on start
  setTimeout(processBroadcasts, 5000);
  setTimeout(checkWebhookHealth, 10000);
}
