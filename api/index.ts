import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { serveStatic } from "../server/_core/vite";
import { registerTelegramWebhook } from "../server/webhook";
import { registerProdamusWebhook } from "../server/prodamus";
import { registerZernioOAuth } from "../server/zernio";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Create app instance for Vercel (no auto-listen)
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

registerStorageProxy(app);
registerOAuthRoutes(app);
registerTelegramWebhook(app);
registerProdamusWebhook(app);
registerZernioOAuth(app);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Production: serve static files
serveStatic(app);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
