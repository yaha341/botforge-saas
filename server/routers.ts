import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { botsRouter } from "./routers/bots";
import { productsRouter, categoriesRouter } from "./routers/products";
import { ordersRouter } from "./routers/orders";
import { broadcastsRouter } from "./routers/broadcasts";
import { instagramRouter } from "./routers/instagram";
import { analyticsRouter } from "./routers/analytics";
import { notificationsRouter } from "./routers/notifications";
import { billingRouter } from "./routers/billing";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  bots: botsRouter,
  products: productsRouter,
  categories: categoriesRouter,
  orders: ordersRouter,
  broadcasts: broadcastsRouter,
  instagram: instagramRouter,
  analytics: analyticsRouter,
  notifications: notificationsRouter,
  billing: billingRouter,
});

export type AppRouter = typeof appRouter;
