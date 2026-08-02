import {
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  bigint,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Bots ─────────────────────────────────────────────────────────────────────
export const bots = mysqlTable("bots", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  botToken: varchar("botToken", { length: 128 }).notNull().unique(),
  botName: varchar("botName", { length: 128 }).notNull(),
  botUsername: varchar("botUsername", { length: 64 }),
  status: mysqlEnum("status", ["active", "paused", "deleted"]).default("active").notNull(),
  moduleShop: boolean("moduleShop").default(false).notNull(),
  moduleCourses: boolean("moduleCourses").default(false).notNull(),
  moduleBroadcasts: boolean("moduleBroadcasts").default(false).notNull(),
  moduleInstagram: boolean("moduleInstagram").default(false).notNull(),
  moduleAiAssistant: boolean("moduleAiAssistant").default(false).notNull(),
  moduleReferral: boolean("moduleReferral").default(false).notNull(),
  moduleCoupons: boolean("moduleCoupons").default(false).notNull(),
  moduleMultiCurrency: boolean("moduleMultiCurrency").default(false).notNull(),
  moduleCrmIntegration: boolean("moduleCrmIntegration").default(false).notNull(),
  webhookUrl: text("webhookUrl"),
  webhookSetAt: timestamp("webhookSetAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Bot = typeof bots.$inferSelect;
export type InsertBot = typeof bots.$inferInsert;

// ─── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  botId: int("botId").notNull(),
  ownerId: int("ownerId").notNull(),
  plan: mysqlEnum("plan", ["free", "basic", "pro", "enterprise"]).default("free").notNull(),
  status: mysqlEnum("subStatus", ["active", "cancelled", "expired", "pending"]).default("pending").notNull(),
  billingCycle: mysqlEnum("billingCycle", ["monthly", "annual"]).default("annual").notNull(),
  priceKzt: decimal("priceKzt", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 8 }).default("KZT"),
  prodamusPaymentId: varchar("prodamusPaymentId", { length: 128 }),
  prodamusOrderId: varchar("prodamusOrderId", { length: 128 }),
  startsAt: timestamp("startsAt"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ─── Bot Users ────────────────────────────────────────────────────────────────
export const botUsers = mysqlTable("bot_users", {
  id: int("id").autoincrement().primaryKey(),
  botId: int("botId").notNull(),
  telegramId: bigint("telegramId", { mode: "number" }).notNull(),
  username: varchar("username", { length: 64 }),
  displayName: varchar("displayName", { length: 128 }),
  contact: varchar("contact", { length: 64 }),
  countryCode: varchar("countryCode", { length: 4 }),
  totalSpent: decimal("totalSpent", { precision: 10, scale: 2 }).default("0"),
  ordersCount: int("ordersCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type BotUser = typeof botUsers.$inferSelect;

// ─── Categories ───────────────────────────────────────────────────────────────
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  botId: int("botId").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  emoji: varchar("emoji", { length: 8 }),
  sortOrder: int("sortOrder").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  botId: int("botId").notNull(),
  categoryId: int("categoryId"),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("KZT"),
  imageUrl: text("imageUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  stock: int("stock"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  botId: int("botId").notNull(),
  botUserId: int("botUserId"),
  telegramId: bigint("telegramId", { mode: "number" }),
  status: mysqlEnum("orderStatus", ["pending", "paid", "shipped", "completed", "cancelled"]).default("pending").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("KZT"),
  paymentMethod: varchar("paymentMethod", { length: 64 }),
  paymentId: varchar("paymentId", { length: 128 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Order = typeof orders.$inferSelect;

// ─── Order Items ──────────────────────────────────────────────────────────────
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  botId: int("botId").notNull(),
  orderId: int("orderId").notNull(),
  productId: int("productId"),
  productName: varchar("productName", { length: 256 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: int("quantity").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type OrderItem = typeof orderItems.$inferSelect;

// ─── Payment Methods ──────────────────────────────────────────────────────────
export const paymentMethods = mysqlTable("payment_methods", {
  id: int("id").autoincrement().primaryKey(),
  botId: int("botId").notNull(),
  name: varchar("name", { length: 64 }).notNull(),
  type: mysqlEnum("pmType", ["kaspi", "card", "crypto", "cash", "other"]).default("other").notNull(),
  details: text("details"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;

// ─── App Settings ─────────────────────────────────────────────────────────────
export const appSettings = mysqlTable("app_settings", {
  id: int("id").autoincrement().primaryKey(),
  botId: int("botId").notNull().unique(),
  welcomeMessage: text("welcomeMessage"),
  currency: varchar("currency", { length: 8 }).default("KZT"),
  language: varchar("language", { length: 8 }).default("ru"),
  adminTelegramId: bigint("adminTelegramId", { mode: "number" }),
  notifyOnOrder: boolean("notifyOnOrder").default(true),
  extraSettings: json("extraSettings"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AppSettings = typeof appSettings.$inferSelect;
export type InsertAppSettings = typeof appSettings.$inferInsert;

// ─── Broadcasts ───────────────────────────────────────────────────────────────
export const broadcasts = mysqlTable("broadcasts", {
  id: int("id").autoincrement().primaryKey(),
  botId: int("botId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  message: text("message").notNull(),
  imageUrl: text("imageUrl"),
  status: mysqlEnum("broadcastStatus", ["draft", "scheduled", "sending", "sent", "failed"]).default("draft").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  totalRecipients: int("totalRecipients").default(0),
  sentCount: int("sentCount").default(0),
  failedCount: int("failedCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Broadcast = typeof broadcasts.$inferSelect;
export type InsertBroadcast = typeof broadcasts.$inferInsert;

// ─── Broadcast Recipients ─────────────────────────────────────────────────────
export const broadcastRecipients = mysqlTable("broadcast_recipients", {
  id: int("id").autoincrement().primaryKey(),
  broadcastId: int("broadcastId").notNull(),
  botId: int("botId").notNull(),
  telegramId: bigint("telegramId", { mode: "number" }).notNull(),
  status: mysqlEnum("recipientStatus", ["pending", "sent", "failed"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  errorMessage: text("errorMessage"),
});
export type BroadcastRecipient = typeof broadcastRecipients.$inferSelect;

// ─── Instagram Accounts ───────────────────────────────────────────────────────
export const igAccounts = mysqlTable("ig_accounts", {
  id: int("id").autoincrement().primaryKey(),
  botId: int("botId").notNull(),
  igAccountId: varchar("igAccountId", { length: 64 }).notNull(),
  igUsername: varchar("igUsername", { length: 64 }).notNull(),
  accessToken: text("accessToken").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  connectedAt: timestamp("connectedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type IgAccount = typeof igAccounts.$inferSelect;
export type InsertIgAccount = typeof igAccounts.$inferInsert;

// ─── Instagram Rules ──────────────────────────────────────────────────────────
export const igRules = mysqlTable("ig_rules", {
  id: int("id").autoincrement().primaryKey(),
  botId: int("botId").notNull(),
  igAccountId: int("igAccountId").notNull(),
  postId: varchar("postId", { length: 64 }),
  keyword: varchar("keyword", { length: 128 }).notNull(),
  dmMessage: text("dmMessage").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  triggeredCount: int("triggeredCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type IgRule = typeof igRules.$inferSelect;
export type InsertIgRule = typeof igRules.$inferInsert;

// ─── Analytics Events ─────────────────────────────────────────────────────────
export const analyticsEvents = mysqlTable("analytics_events", {
  id: int("id").autoincrement().primaryKey(),
  botId: int("botId").notNull(),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }),
  meta: json("meta"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

// ─── Platform Notifications ───────────────────────────────────────────────────
export const platformNotifications = mysqlTable("platform_notifications", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("notifType", ["new_bot", "subscription_purchased", "payment_failed", "system"]).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  body: text("body").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  meta: json("meta"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PlatformNotification = typeof platformNotifications.$inferSelect;
