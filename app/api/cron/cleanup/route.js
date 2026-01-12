import { listExpiredPendingOrders, updateOrder } from "../../../../lib/orders.js";
import { getRuntimeSettings, inferBaseUrlFromHeaders } from "../../../../lib/runtimeSettings.js";
import { deleteMessage, sendPhotoUrl } from "../../../../lib/telegram.js";
import { failCaption } from "../../../../lib/captions.js";

export const runtime = "nodejs";

async function safeDelete(chatId, messageId) {
  if (!chatId || !messageId) return;
  await deleteMessage(chatId, messageId);
}

export async function GET(req) {
  const settings = await getRuntimeSettings();
  const baseUrl = inferBaseUrlFromHeaders(req.headers, settings);

  let processed = 0;
  try {
    const orders = await listExpiredPendingOrders(new Date());
    for (const o of orders) {
      await safeDelete(o.chatId, o.qrisMessageId);
      await safeDelete(o.chatId, o.pendingMessageId);
      await sendPhotoUrl(o.chatId, baseUrl + settings.assets.fail, failCaption());
      await updateOrder(o.orderId, { status: "failed", paymentStatus: "expired", failedAt: new Date() });
      processed += 1;
    }
  } catch (e) {
    console.error("cleanup cron error:", e);
  }

  return Response.json({ ok: true, processed });
}
