import type { Express, Request, Response } from "express";
import axios from "axios";
import { getDb, createIgAccount } from "./db";
import { bots } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const ZERNIO_API_URL = "https://api.zernio.com";
const ZERNIO_API_KEY = process.env.ZERNIO_API_KEY ?? "sk_56e035fc200bc47530f01ad7c264fb04a94ab7ab4c3c3faff292f8371a98adbf";

export function registerZernioOAuth(app: Express) {
  // Initiate Instagram OAuth via Zernio
  app.get("/api/zernio/connect", async (req: Request, res: Response) => {
    const { botId } = req.query;
    if (!botId) {
      res.status(400).json({ error: "botId required" });
      return;
    }

    try {
      const callbackUrl = `${process.env.APP_PUBLIC_URL ?? ""}/api/zernio/callback?botId=${botId}`;
      const response = await axios.post(`${ZERNIO_API_URL}/v1/oauth/initiate`, {
        callback_url: callbackUrl,
        scope: ["instagram_basic", "instagram_manage_comments", "pages_messaging"],
      }, {
        headers: { Authorization: `Bearer ${ZERNIO_API_KEY}` },
        timeout: 10000,
      });

      const authUrl = response.data?.auth_url ?? response.data?.url;
      if (authUrl) {
        res.redirect(authUrl);
      } else {
        res.status(500).json({ error: "Failed to get auth URL from Zernio" });
      }
    } catch (err: any) {
      console.error("[Zernio] OAuth initiate error:", err?.response?.data ?? err.message);
      res.status(500).json({ error: "Zernio OAuth initiation failed" });
    }
  });

  // Zernio OAuth callback
  app.get("/api/zernio/callback", async (req: Request, res: Response) => {
    const { botId, code, access_token, ig_user_id, username } = req.query as Record<string, string>;

    try {
      const db = await getDb();
      if (!db || !botId) {
        res.redirect(`/bots/${botId}/instagram?error=db_unavailable`);
        return;
      }

      // Verify bot exists
      const botRows = await db.select().from(bots).where(eq(bots.id, parseInt(botId))).limit(1);
      if (!botRows[0]) {
        res.redirect(`/?error=bot_not_found`);
        return;
      }

      let igUserId = ig_user_id;
      let igUsername = username;
      let igAccessToken = access_token;

      // If we have a code but not a token, exchange it
      if (code && !access_token) {
        try {
          const tokenRes = await axios.post(`${ZERNIO_API_URL}/v1/oauth/token`, { code }, {
            headers: { Authorization: `Bearer ${ZERNIO_API_KEY}` },
            timeout: 10000,
          });
          igAccessToken = tokenRes.data?.access_token;
          igUserId = tokenRes.data?.ig_user_id ?? tokenRes.data?.user_id;
          igUsername = tokenRes.data?.username;
        } catch (err: any) {
          console.error("[Zernio] Token exchange error:", err?.response?.data ?? err.message);
          res.redirect(`/bots/${botId}/instagram?error=token_exchange_failed`);
          return;
        }
      }

      if (!igAccessToken) {
        res.redirect(`/bots/${botId}/instagram?error=no_token`);
        return;
      }

      await createIgAccount({
        botId: parseInt(botId),
        igAccountId: igUserId ?? "unknown",
        igUsername: igUsername ?? "unknown",
        accessToken: igAccessToken,
      });

      res.redirect(`/bots/${botId}/instagram?success=connected`);
    } catch (err) {
      console.error("[Zernio] Callback error:", err);
      res.redirect(`/bots/${botId}/instagram?error=callback_failed`);
    }
  });
}
