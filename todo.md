# FrogFlow Studio — TODO

## Phase 1: Migration to Supabase + PostgreSQL
- [x] Define PostgreSQL Drizzle schema: users, bots, subscriptions, bot_users, categories, products, orders, order_items, payment_methods, app_settings, broadcasts, broadcast_recipients, ig_accounts, ig_rules, analytics_events, platform_notifications
- [x] Switch drizzle from mysql to postgresql
- [x] Replace mysql2 with postgres + postgres-js driver
- [x] Update all DB queries to use PostgreSQL syntax (onConflictDoUpdate, bigint, etc.)
- [x] Remove mysql-specific code

## Phase 2: FrogFlow Studio Branding
- [x] Dark theme with green accents (oklch color palette)
- [x] Space Grotesk display font + Inter body font
- [x] FrogFlow logo branding throughout
- [x] Russian language throughout (all UI text)
- [x] Custom CSS: glow-green, card-frog, btn-frog, green-line, frosted, nav-glass

## Phase 3: Pricing Model — Trading Plan
- [x] Single "Trading" tariff — full functionality, no tier restrictions
- [x] Price: 49,000 KZT / year
- [x] All modules unlocked on payment (Shop, Courses, Broadcasts, Instagram, AI, Referral, Coupons, Multi-Currency, CRM)
- [x] Flexible module selection (user picks what they need)
- [x] Removed old Basic/Pro/Enterprise tiers

## Phase 4: Environment Variables (Vercel)
- [x] DATABASE_URL → Supabase PostgreSQL connection string
- [x] ZERNIO_API_KEY → sk_56e035fc...
- [x] PRODAMUS_SHOP_URL → Prodamus payment URL
- [x] PRODAMUS_SECRET_KEY → Prodamus secret
- [x] APP_PUBLIC_URL → https://botforge-saas.vercel.app
- [x] JWT_SECRET → Cookie secret
- [x] .env.example created with instructions

## Phase 5: Vercel Deployment
- [ ] Push to GitHub: yaha341/botforge-saas
- [ ] Add environment variables in Vercel Settings → Environment Variables
- [ ] Deploy new build
- [ ] Run DB migrations: `pnpm db:generate && pnpm db:migrate`
- [ ] Register Telegram webhooks for existing bots
- [ ] Configure Prodamus webhook URL: https://botforge-saas.vercel.app/api/prodamus/webhook

## Phase 6: Future Improvements
- [ ] Migrate payment from Prodamus to Prodamus (Продамус) when ready
- [ ] Add Supabase direct client for real-time features
- [ ] Instagram automation improvements
- [ ] Multi-bot dashboard analytics
- [ ] Client onboarding flow (3 existing clients)
