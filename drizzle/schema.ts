import {
  boolean,
  decimal,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  bigint,
  serial,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const statusEnum = pgEnum("status", ["active", "paused", "deleted"]);
export const subStatusEnum = pgEnum("sub_status", ["active", "cancelled", "expired", "pending"]);
export const planEnum = pgEnum("plan", ["trading"]);
export const billingCycleEnum = pgEnum("billing_cycle", ["monthly", "annual"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "shipped", "completed", "cancelled"]);
export const pmTypeEnum = pgEnum("pm_type", ["kaspi", "card", "crypto", "cash", "other"]);
export const broadcastStatusEnum = pgEnum("broadcast_status", ["draft", "scheduled", "sending", "sent", "failed"]);
export const recipientStatusEnum = pgEnum("recipient_status", ["pending", "sent", "failed"]);
export const notifTypeEnum = pgEnum("notif_type", ["new_bot", "subscription_purchased", "payment_failed", "system"]);

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Bots ─────────────────────────────────────────────────────────────────────
export const bots = pgTable("bots", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(),
  botToken: varchar("bot_token", { length: 128 }).notNull(),
  botName: varchar("bot_name", { length: 128 }).notNull(),
  botUsername: varchar("bot_username", { length: 64 }),
  status: statusEnum("status").default("active").notNull(),
  moduleShop: boolean("module_shop").default(false).notNull(),
  moduleCourses: boolean("module_courses").default(false).notNull(),
  moduleBroadcasts: boolean("module_broadcasts").default(false).notNull(),
  moduleInstagram: boolean("module_instagram").default(false).notNull(),
  moduleAiAssistant: boolean("module_ai_assistant").default(false).notNull(),
  moduleReferral: boolean("module_referral").default(false).notNull(),
  moduleCoupons: boolean("module_coupons").default(false).notNull(),
  moduleMultiCurrency: boolean("module_multi_currency").default(false).notNull(),
  moduleCrmIntegration: boolean("module_crm_integration").default(false).notNull(),
  webhookUrl: text("webhook_url"),
  webhookSetAt: timestamp("webhook_set_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("bots_token_idx").on(table.botToken),
]);
export type Bot = typeof bots.$inferSelect;
export type InsertBot = typeof bots.$inferInsert;

// ─── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull(),
  ownerId: integer("owner_id").notNull(),
  plan: planEnum("plan").default("trading").notNull(),
  status: subStatusEnum("status").default("pending").notNull(),
  billingCycle: billingCycleEnum("billing_cycle").default("annual").notNull(),
  priceKzt: decimal("price_kzt", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 8 }).default("KZT"),
  prodamusPaymentId: varchar("prodamus_payment_id", { length: 128 }),
  prodamusOrderId: varchar("prodamus_order_id", { length: 128 }),
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ─── Bot Users ────────────────────────────────────────────────────────────────
export const botUsers = pgTable("bot_users", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull(),
  telegramId: bigint("telegram_id", { mode: "number" }).notNull(),
  username: varchar("username", { length: 64 }),
  displayName: varchar("display_name", { length: 128 }),
  contact: varchar("contact", { length: 64 }),
  countryCode: varchar("country_code", { length: 4 }),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0"),
  ordersCount: integer("orders_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export type BotUser = typeof botUsers.$inferSelect;

// ─── Categories ───────────────────────────────────────────────────────────────
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  emoji: varchar("emoji", { length: 8 }),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull(),
  categoryId: integer("category_id"),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("KZT"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  stock: integer("stock"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull(),
  botUserId: integer("bot_user_id"),
  telegramId: bigint("telegram_id", { mode: "number" }),
  status: orderStatusEnum("status").default("pending").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("KZT"),
  paymentMethod: varchar("payment_method", { length: 64 }),
  paymentId: varchar("payment_id", { length: 128 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export type Order = typeof orders.$inferSelect;

// ─── Order Items ──────────────────────────────────────────────────────────────
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id"),
  productName: varchar("product_name", { length: 256 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type OrderItem = typeof orderItems.$inferSelect;

// ─── Payment Methods ──────────────────────────────────────────────────────────
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull(),
  name: varchar("name", { length: 64 }).notNull(),
  type: pmTypeEnum("type").default("other").notNull(),
  details: text("details"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;

// ─── App Settings ─────────────────────────────────────────────────────────────
export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull().unique(),
  welcomeMessage: text("welcome_message"),
  currency: varchar("currency", { length: 8 }).default("KZT"),
  language: varchar("language", { length: 8 }).default("ru"),
  adminTelegramId: bigint("admin_telegram_id", { mode: "number" }),
  notifyOnOrder: boolean("notify_on_order").default(true),
  extraSettings: json("extra_settings"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export type AppSettings = typeof appSettings.$inferSelect;
export type InsertAppSettings = typeof appSettings.$inferInsert;

// ─── Broadcasts ───────────────────────────────────────────────────────────────
export const broadcasts = pgTable("broadcasts", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  message: text("message").notNull(),
  imageUrl: text("image_url"),
  status: broadcastStatusEnum("status").default("draft").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  totalRecipients: integer("total_recipients").default(0),
  sentCount: integer("sent_count").default(0),
  failedCount: integer("failed_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export type Broadcast = typeof broadcasts.$inferSelect;
export type InsertBroadcast = typeof broadcasts.$inferInsert;

// ─── Broadcast Recipients ─────────────────────────────────────────────────────
export const broadcastRecipients = pgTable("broadcast_recipients", {
  id: serial("id").primaryKey(),
  broadcastId: integer("broadcast_id").notNull(),
  botId: integer("bot_id").notNull(),
  telegramId: bigint("telegram_id", { mode: "number" }).notNull(),
  status: recipientStatusEnum("status").default("pending").notNull(),
  sentAt: timestamp("sent_at"),
  errorMessage: text("error_message"),
});
export type BroadcastRecipient = typeof broadcastRecipients.$inferSelect;

// ─── Instagram Accounts ───────────────────────────────────────────────────────
export const igAccounts = pgTable("ig_accounts", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull(),
  igAccountId: varchar("ig_account_id", { length: 64 }).notNull(),
  igUsername: varchar("ig_username", { length: 64 }).notNull(),
  accessToken: text("access_token").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export type IgAccount = typeof igAccounts.$inferSelect;
export type InsertIgAccount = typeof igAccounts.$inferInsert;

// ─── Instagram Rules ──────────────────────────────────────────────────────────
export const igRules = pgTable("ig_rules", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull(),
  igAccountId: integer("ig_account_id").notNull(),
  postId: varchar("post_id", { length: 64 }),
  keyword: varchar("keyword", { length: 128 }).notNull(),
  dmMessage: text("dm_message").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  triggeredCount: integer("triggered_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type IgRule = typeof igRules.$inferSelect;
export type InsertIgRule = typeof igRules.$inferInsert;

// ─── Analytics Events ─────────────────────────────────────────────────────────
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull(),
  eventType: varchar("event_type", { length: 64 }).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }),
  meta: json("meta"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

// ─── Platform Notifications ───────────────────────────────────────────────────
export const platformNotifications = pgTable("platform_notifications", {
  id: serial("id").primaryKey(),
  type: notifTypeEnum("type").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  body: text("body").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  meta: json("meta"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type PlatformNotification = typeof platformNotifications.$inferSelect;
