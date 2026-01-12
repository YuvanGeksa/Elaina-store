import { getOrderById, updateOrder } from "../../../lib/orders.js";
import { pakasirTransactionDetail } from "../../../lib/pakasir.js";
import { getRuntimeSettings, inferBaseUrlFromHeaders } from "../../../lib/runtimeSettings.js";
import { deleteMessage, sendPhotoUrl, sendMessage, sendDocumentBuffer } from "../../../lib/telegram.js";
import { successCaption, failCaption, panelDeliverCaption, adminDeliverCaption, resellerDeliverCaption, scriptDeliverCaption } from "../../../lib/captions.js";
import { randomPassword, createPanelUser, createPanelServer } from "../../../lib/ptero.js";
import { downloadScriptZip } from "../../../lib/scripts.js";

export const runtime = "nodejs";

async function safeDelete(chatId, messageId) {
  if (!chatId || !messageId) return;
  await deleteMessage(chatId, messageId);
}

export async function POST(req) {
  const settings = await getRuntimeSettings();
  const baseUrl = inferBaseUrlFromHeaders(req.headers, settings);

  try {
    const body = await req.json();
    const orderId = body?.order_id;
    const amount = body?.amount;

    if (!orderId || !amount) return Response.json({ ok: true });

    const order = await getOrderById(orderId);
    if (!order) return Response.json({ ok: true });

    // Verify via transactiondetail for valid status
    const trx = await pakasirTransactionDetail(orderId, amount);

    if (trx.status === "completed") {
      // Idempotent: if already delivered, stop
      if (order.status === "delivered") return Response.json({ ok: true });

      // Update order status
      await updateOrder(orderId, { status: "paid", paymentStatus: "completed", completedAt: trx.completed_at || new Date() });

      // Delete pending + QR messages
      await safeDelete(order.chatId, order.qrisMessageId);
      await safeDelete(order.chatId, order.pendingMessageId);

      // Send success photo
      await sendPhotoUrl(order.chatId, baseUrl + settings.assets.success, successCaption());

      // Deliver product
      await deliver(order, settings, baseUrl);

      await updateOrder(orderId, { status: "delivered", deliveredAt: new Date() });
      return Response.json({ ok: true });
    }

    // If webhook arrives with other status, we don't fail immediately (expiry handled by cron).
    await updateOrder(orderId, { paymentStatus: trx.status });
  } catch (e) {
    console.error("Pakasir webhook error:", e);
  }

  return Response.json({ ok: true });
}

async function deliver(order, settings, baseUrl) {
  const chatId = order.chatId;

  if (order.productCode === "buyreseller") {
    await sendMessage(chatId, resellerDeliverCaption(settings.reseller.groupLink));
    return;
  }

  if (order.productCode === "buyscript") {
    // Load ZIP from GridFS and send
    try {
      const buf = await downloadScriptZip(order.meta.fileId);
      await sendDocumentBuffer(chatId, buf, order.meta.filename || "script.zip", scriptDeliverCaption(settings));
    } catch (e) {
      await sendMessage(chatId, "<b>⚠️ Gagal mengirim file script</b>\nSilakan hubungi admin.");
      console.error("Deliver script error:", e);
    }
    return;
  }

  if (order.productCode === "buypanel" || order.productCode === "buyadminpanel") {
    const isAdmin = order.productCode === "buyadminpanel";
    const username = order.meta.username;
    const password = randomPassword(12);
    const email = `${username}@elaina.local`;

    const egg = order.meta.egg;
    const eggId = egg === "py" ? settings.pterodactyl.eggPyId : settings.pterodactyl.eggJsId;
    const eggName = egg === "py" ? "Python" : "JavaScript";

    try {
      const user = await createPanelUser({
        username,
        email,
        password,
        isAdmin,
      });

      if (!user?.id) throw new Error("Pterodactyl user create failed (no id)");

      if (!isAdmin) {
        // Create server too
        await createPanelServer({
          userId: user.id,
          eggId,
          name: `${username}-server`,
        });
      }

      if (isAdmin) {
        await sendMessage(chatId, adminDeliverCaption(settings, { username, password }));
      } else {
        await sendMessage(chatId, panelDeliverCaption(settings, { username, password, eggName }));
      }

    } catch (e) {
      console.error("Deliver panel/admin error:", e);
      await sendMessage(chatId, "<b>⚠️ Provisioning error</b>\nPembayaran sudah diterima, tapi sistem gagal membuat akun/server. Admin akan proses manual.");
    }
    return;
  }

  // Unknown product
  await sendMessage(chatId, "<b>⚠️ Produk tidak dikenali</b>\nHubungi admin.");
}
