import type { Express, Request, Response } from "express";
import axios from "axios";
import { getBotByToken, getSettingsForBot, getProductsForBot, getCategoriesForBot } from "./db";

// Dynamic Telegram webhook router — dispatches updates to the correct bot config
export function registerTelegramWebhook(app: Express) {
  app.post("/api/webhook/:bot_token", async (req: Request, res: Response) => {
    const { bot_token } = req.params;
    const update = req.body;

    try {
      // Look up bot configuration by token
      const bot = await getBotByToken(bot_token);
      if (!bot || bot.status !== "active") {
        res.json({ ok: false, error: "Bot not found or inactive" });
        return;
      }

      // Dispatch update to appropriate handler
      await dispatchUpdate(bot_token, bot, update);
      res.json({ ok: true });
    } catch (err) {
      console.error("[Webhook] Error processing update:", err);
      res.json({ ok: true }); // Always return 200 to Telegram
    }
  });
}

async function sendTelegramMessage(token: string, chatId: number | string, text: string, options: Record<string, unknown> = {}) {
  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      ...options,
    }, { timeout: 10000 });
  } catch (err) {
    console.error("[Webhook] Failed to send message:", err);
  }
}

async function dispatchUpdate(token: string, bot: any, update: any) {
  const message = update.message;
  if (!message) return;

  const chatId = message.chat?.id;
  const text = message.text ?? "";
  const settings = await getSettingsForBot(bot.id);

  // Handle /start command
  if (text === "/start") {
    const welcome = settings?.welcomeMessage ?? `Welcome to <b>${bot.botName}</b>! Use the menu below to get started.`;
    const keyboard: any = { keyboard: [], resize_keyboard: true };

    if (bot.moduleShop) keyboard.keyboard.push([{ text: "🛒 Shop" }]);
    if (bot.moduleCourses) keyboard.keyboard.push([{ text: "📚 Courses" }]);
    if (bot.moduleReferral) keyboard.keyboard.push([{ text: "👥 Referral" }]);

    await sendTelegramMessage(token, chatId, welcome, { reply_markup: keyboard });
    return;
  }

  // Handle shop
  if (text === "🛒 Shop" && bot.moduleShop) {
    const cats = await getCategoriesForBot(bot.id);
    if (cats.length === 0) {
      await sendTelegramMessage(token, chatId, "No products available yet.");
      return;
    }
    const catText = cats.map((c: any) => `${c.emoji ?? "📦"} ${c.name}`).join("\n");
    await sendTelegramMessage(token, chatId, `<b>Categories:</b>\n\n${catText}`);
    return;
  }

  // Handle courses
  if (text === "📚 Courses" && bot.moduleCourses) {
    const prods = await getProductsForBot(bot.id);
    const courses = prods.filter((p: any) => p.type === "course");
    if (courses.length === 0) {
      await sendTelegramMessage(token, chatId, "No courses available yet.");
      return;
    }
    const courseText = courses.map((c: any) => `📖 <b>${c.name}</b> — ${c.price} ${settings?.currency ?? "KZT"}`).join("\n");
    await sendTelegramMessage(token, chatId, `<b>Available Courses:</b>\n\n${courseText}`);
    return;
  }

  // Default fallback
  await sendTelegramMessage(token, chatId, "Use the menu to navigate or type /start to restart.");
}
