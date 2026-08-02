import { eq, desc, and, sql, gte, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser, users,
  bots, Bot, InsertBot,
  subscriptions, InsertSubscription,
  botUsers,
  categories, InsertCategory,
  products, InsertProduct,
  orders,
  orderItems,
  paymentMethods, InsertPaymentMethod,
  appSettings, InsertAppSettings,
  broadcasts, InsertBroadcast,
  broadcastRecipients,
  igAccounts, InsertIgAccount,
  igRules, InsertIgRule,
  analyticsEvents,
  platformNotifications,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle + postgres client so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _client = postgres(process.env.DATABASE_URL, { max: 5 });
      _db = drizzle(_client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _client = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Bots ─────────────────────────────────────────────────────────────────────
export async function getBotsForUser(ownerId: number): Promise<Bot[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bots).where(and(eq(bots.ownerId, ownerId), sql`${bots.status} != 'deleted'`)).orderBy(desc(bots.createdAt));
}

export async function getBotById(botId: number, ownerId: number): Promise<Bot | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bots).where(and(eq(bots.id, botId), eq(bots.ownerId, ownerId))).limit(1);
  return result[0];
}

export async function getBotByToken(botToken: string): Promise<Bot | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bots).where(eq(bots.botToken, botToken)).limit(1);
  return result[0];
}

export async function createBot(data: InsertBot): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(bots).values(data).returning({ id: bots.id });
  return result[0]?.id ?? 0;
}

export async function updateBotStatus(botId: number, ownerId: number, status: "active" | "paused" | "deleted"): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(bots).set({ status }).where(and(eq(bots.id, botId), eq(bots.ownerId, ownerId)));
}

export async function updateBotModules(botId: number, ownerId: number, modules: Partial<Bot> | Record<string, boolean>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(bots).set({ ...modules, updatedAt: new Date() }).where(and(eq(bots.id, botId), eq(bots.ownerId, ownerId)));
}

export async function updateBotWebhook(botId: number, webhookUrl: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(bots).set({ webhookUrl, webhookSetAt: new Date() }).where(eq(bots.id, botId));
}

// ─── Subscriptions ────────────────────────────────────────────────────────────
export async function getSubscriptionsForUser(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscriptions).where(eq(subscriptions.ownerId, ownerId)).orderBy(desc(subscriptions.createdAt));
}

export async function getActiveSubscriptionForBot(botId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(
    and(eq(subscriptions.botId, botId), eq(subscriptions.status, "active"))
  ).limit(1);
  return result[0];
}

export async function createSubscription(data: InsertSubscription): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(subscriptions).values(data).returning({ id: subscriptions.id });
  return result[0]?.id ?? 0;
}

export async function activateSubscription(subscriptionId: number, prodamusPaymentId: string, expiresAt: Date): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const sub = await db.select().from(subscriptions).where(eq(subscriptions.id, subscriptionId)).limit(1);
  if (!sub[0]) return;
  await db.update(subscriptions).set({
    status: "active",
    prodamusPaymentId,
    startsAt: new Date(),
    expiresAt,
  }).where(eq(subscriptions.id, subscriptionId));
  // Unlock ALL modules for Trading plan — full functionality
  const modules = getTradingModules();
  await db.update(bots).set(modules).where(eq(bots.id, sub[0].botId));
}

// Trading plan = all modules unlocked (full functionality, no tier restrictions)
function getTradingModules(): Partial<Bot> {
  return {
    moduleShop: true,
    moduleCourses: true,
    moduleBroadcasts: true,
    moduleInstagram: true,
    moduleAiAssistant: true,
    moduleReferral: true,
    moduleCoupons: true,
    moduleMultiCurrency: true,
    moduleCrmIntegration: true,
  };
}

// ─── Categories ───────────────────────────────────────────────────────────────
export async function getCategoriesForBot(botId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.botId, botId)).orderBy(categories.sortOrder);
}

export async function createCategory(data: InsertCategory): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(categories).values(data).returning({ id: categories.id });
  return result[0]?.id ?? 0;
}

export async function deleteCategory(categoryId: number, botId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(categories).where(and(eq(categories.id, categoryId), eq(categories.botId, botId)));
}

// ─── Products ─────────────────────────────────────────────────────────────────
export async function getProductsForBot(botId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.botId, botId)).orderBy(products.sortOrder);
}

export async function createProduct(data: InsertProduct): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(products).values(data).returning({ id: products.id });
  return result[0]?.id ?? 0;
}

export async function deleteProduct(productId: number, botId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(products).where(and(eq(products.id, productId), eq(products.botId, botId)));
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function getOrdersForBot(botId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.botId, botId)).orderBy(desc(orders.createdAt));
}

// ─── Payment Methods ──────────────────────────────────────────────────────────
export async function getPaymentMethodsForBot(botId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentMethods).where(eq(paymentMethods.botId, botId));
}

export async function createPaymentMethod(data: InsertPaymentMethod): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(paymentMethods).values(data).returning({ id: paymentMethods.id });
  return result[0]?.id ?? 0;
}

export async function deletePaymentMethod(pmId: number, botId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(paymentMethods).where(and(eq(paymentMethods.id, pmId), eq(paymentMethods.botId, botId)));
}

// ─── App Settings ─────────────────────────────────────────────────────────────
export async function getSettingsForBot(botId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(appSettings).where(eq(appSettings.botId, botId)).limit(1);
  return result[0];
}

export async function upsertSettings(data: InsertAppSettings): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(appSettings).values(data).onConflictDoUpdate({
    target: appSettings.botId,
    set: { welcomeMessage: data.welcomeMessage, currency: data.currency, language: data.language, adminTelegramId: data.adminTelegramId, notifyOnOrder: data.notifyOnOrder, extraSettings: data.extraSettings },
  });
}

// ─── Broadcasts ───────────────────────────────────────────────────────────────
export async function getBroadcastsForBot(botId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(broadcasts).where(eq(broadcasts.botId, botId)).orderBy(desc(broadcasts.createdAt));
}

export async function createBroadcast(data: InsertBroadcast): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(broadcasts).values(data).returning({ id: broadcasts.id });
  return result[0]?.id ?? 0;
}

export async function sendBroadcast(broadcastId: number, botId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  // Get all bot users
  const botUsersList = await db.select().from(botUsers).where(eq(botUsers.botId, botId));
  const broadcast = await db.select().from(broadcasts).where(eq(broadcasts.id, broadcastId)).limit(1);
  if (!broadcast[0]) return;
  // Update total recipients and status
  await db.update(broadcasts).set({ status: "sending", totalRecipients: botUsersList.length }).where(eq(broadcasts.id, broadcastId));
  // Insert recipients
  if (botUsersList.length > 0) {
    const recipients = botUsersList.map(u => ({ broadcastId, botId, telegramId: u.telegramId, status: "pending" as const }));
    await db.insert(broadcastRecipients).values(recipients);
  }
}

// ─── Instagram ────────────────────────────────────────────────────────────────
export async function getIgAccountsForBot(botId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(igAccounts).where(eq(igAccounts.botId, botId));
}

export async function createIgAccount(data: InsertIgAccount): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(igAccounts).values(data).returning({ id: igAccounts.id });
  return result[0]?.id ?? 0;
}

export async function deleteIgAccount(accountId: number, botId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(igAccounts).where(and(eq(igAccounts.id, accountId), eq(igAccounts.botId, botId)));
}

export async function getIgRulesForBot(botId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(igRules).where(eq(igRules.botId, botId));
}

export async function createIgRule(data: InsertIgRule): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(igRules).values(data).returning({ id: igRules.id });
  return result[0]?.id ?? 0;
}

export async function deleteIgRule(ruleId: number, botId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(igRules).where(and(eq(igRules.id, ruleId), eq(igRules.botId, botId)));
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export async function getBotStats(botId: number) {
  const db = await getDb();
  if (!db) return { totalOrders: 0, totalRevenue: 0, activeUsers: 0, broadcastsSent: 0, ordersChart: [] };
  const [ordersResult, usersResult, broadcastsResult] = await Promise.all([
    db.select({ cnt: count(), rev: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)` }).from(orders).where(eq(orders.botId, botId)),
    db.select({ cnt: count() }).from(botUsers).where(eq(botUsers.botId, botId)),
    db.select({ cnt: count() }).from(broadcasts).where(and(eq(broadcasts.botId, botId), eq(broadcasts.status, "sent"))),
  ]);
  // Last 7 days chart
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const chartData = await db.select({
    date: sql<string>`DATE(${orders.createdAt})`,
    count: count(),
  }).from(orders).where(and(eq(orders.botId, botId), gte(orders.createdAt, sevenDaysAgo))).groupBy(sql`DATE(${orders.createdAt})`);
  return {
    totalOrders: ordersResult[0]?.cnt ?? 0,
    totalRevenue: parseFloat(ordersResult[0]?.rev ?? "0"),
    activeUsers: usersResult[0]?.cnt ?? 0,
    broadcastsSent: broadcastsResult[0]?.cnt ?? 0,
    ordersChart: chartData,
  };
}

// ─── Notifications ────────────────────────────────────────────────────────────
export async function getNotifications(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(platformNotifications).orderBy(desc(platformNotifications.createdAt)).limit(limit);
}

export async function markNotificationRead(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(platformNotifications).set({ isRead: true }).where(eq(platformNotifications.id, id));
}

export async function createNotification(data: { type: "new_bot" | "subscription_purchased" | "payment_failed" | "system"; title: string; body: string; meta?: unknown }): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(platformNotifications).values({ ...data, meta: data.meta ?? null });
}

// ─── Broadcast Queue (cron) ───────────────────────────────────────────────────
export async function getPendingBroadcasts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(broadcasts).where(eq(broadcasts.status, "sending")).limit(10);
}
