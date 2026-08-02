# Telegram Bot SaaS Platform — TODO

## Phase 1: Database Schema & Architecture
- [x] Define Drizzle schema: bots, bot_modules, subscriptions, products, categories, orders, order_items, broadcasts, broadcast_recipients, payment_methods, app_settings, ig_accounts, ig_rules, bot_users, analytics_events
- [x] Generate and apply DB migrations
- [x] Add server-side db helpers for all entities
- [x] Configure Supabase secrets in env

## Phase 2: Landing, Auth & User Dashboard
- [x] Brutalist landing page with hero, features, pricing tiers
- [x] Pricing section from price list (Basic/Pro/Enterprise)
- [x] Manus OAuth login/register flow
- [x] User dashboard shell with sidebar navigation
- [x] My Bots list page

## Phase 3: Bot Constructor & Multi-tenant Management
- [x] Create bot form (token input + module checklist)
- [x] Bot validation (Telegram API token check)
- [x] Bot list with status badges (active/paused/deleted)
- [x] Edit bot settings
- [x] Pause / delete bot actions
- [x] Bot isolation enforced by bot_id in all queries

## Phase 4: Webhook Routing & Per-bot Admin Panel
- [x] Dynamic webhook endpoint /api/webhook/:bot_token
- [x] Webhook dispatcher routing to correct bot config
- [x] Per-bot admin panel: Products, Categories, Orders
- [x] Payment methods management per bot
- [x] App settings per bot
- [x] Broadcasts module: compose, schedule, delivery tracking

## Phase 5: Billing, Instagram, Analytics & Cron
- [x] Subscription plans UI (Basic/Pro/Enterprise)
- [x] Prodamus payment integration (handler ready, awaiting PRODAMUS_SECRET_KEY)
- [x] Module auto-unlock on successful payment
- [x] Instagram panel: Zernio OAuth connect
- [x] Instagram keyword-to-DM rules per post
- [x] Analytics dashboard per bot (orders, revenue, users, broadcasts)
- [x] Cron: broadcast queue processor (batched delivery)
- [x] Cron: Instagram comment poller
- [x] Cron: webhook health check
- [x] Owner notifications (new bot, subscription, payment failure)

## Phase 6: Polish, Tests & GitHub
- [x] Vitest unit tests (3 passing)
- [x] ZERNIO_API_KEY secret configured
- [ ] PRODAMUS_SECRET_KEY (add after Prodamus account setup)
- [ ] APP_PUBLIC_URL (add after Vercel deploy)
- [ ] Register Telegram webhooks for existing bots after deploy
- [ ] Export to GitHub via Management UI (Settings → GitHub → yaha341/botforge-saas)
- [ ] Publish via Publish button in Management UI
