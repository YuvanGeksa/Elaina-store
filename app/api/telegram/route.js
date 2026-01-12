import { handleTelegramUpdate } from "../../../lib/bot.js";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const update = await req.json();
    await handleTelegramUpdate(update, req.headers);
  } catch (e) {
    console.error("Telegram webhook error:", e);
  }
  return Response.json({ ok: true });
}
