import { getRuntimeSettings, inferBaseUrlFromHeaders } from "./runtimeSettings.js";
import { buildReplyKeyboard, buildInlineKeyboard, sendPhotoUrl, sendPhotoBuffer, sendMessage, answerCallbackQuery } from "./telegram.js";
import { startCaption, chooseEggCaption, askPanelUsernameCaption, askAdminUsernameCaption, scriptsCaption, qrisCaption } from "./captions.js";
import { setUserState, getUserState, clearUserState, ensureStateTTL } from "./state.js";
import { createOrder, updateOrder } from "./orders.js";
import { pakasirCreateQris } from "./pakasir.js";
import { qrisToPngBuffer } from "./qris.js";
import { listScripts, getScriptMetaById } from "./scripts.js";

function normalizeText(t) {
  return (t || "").trim();
}

function isValidUsername(u) {
  // Alnum + underscore, 3-24 chars
  return /^[a-zA-Z0-9_]{3,24}$/.test(u);
}

function newOrderId(userId) {
  return `TG${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function handleTelegramUpdate(update, headers) {
  const settings = await getRuntimeSettings();
  await ensureStateTTL();

  const baseUrl = inferBaseUrlFromHeaders(headers, settings);
  const thumbUrl = baseUrl + settings.assets.thumbnail;
  const pendingUrl = baseUrl + settings.assets.pending;

  // MESSAGE
  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat?.id;
    const userId = msg.from?.id;
    const text = normalizeText(msg.text);

    if (!chatId || !userId) return;

    if (text === "/start" || text === "/menu") {
      await sendPhotoUrl(chatId, thumbUrl, startCaption(settings), { reply_markup: buildReplyKeyboard(settings) });
      await clearUserState(userId);
      return;
    }

    // Reply-keyboard shortcuts
    if (text === settings.botUI.btnBuyPanel) {
      const kb = buildInlineKeyboard([
        [{ text: "JavaScript", callback_data: "panel_egg:js" }, { text: "Python", callback_data: "panel_egg:py" }],
        [{ text: "⬅ Back", callback_data: "back:menu" }],
      ]);
      await sendPhotoUrl(chatId, thumbUrl, chooseEggCaption(), { reply_markup: kb });
      await clearUserState(userId);
      return;
    }

    if (text === settings.botUI.btnBuyAdmin) {
      await sendMessage(chatId, askAdminUsernameCaption());
      await setUserState(userId, { step: "await_admin_username" }, 10);
      return;
    }

    if (text === settings.botUI.btnBuyReseller) {
      await startPaymentFlow({
        chatId,
        userId,
        productCode: "buyreseller",
        amount: settings.pricing.buyReseller,
        meta: {},
        baseUrl,
      });
      return;
    }

    if (text === settings.botUI.btnBuyScript) {
      const scripts = await listScripts().catch(() => []);
      const rows = [];
      for (const s of scripts) {
        rows.push([{ text: s.displayName, callback_data: `script_buy:${String(s._id)}` }]);
      }
      rows.push([{ text: "⬅ Back", callback_data: "back:menu" }]);

      if (!scripts.length) {
        await sendMessage(chatId, "<b>📦 Script kosong</b>\n\nSaat ini belum ada script yang tersedia. Silakan coba lagi nanti.");
        return;
      }

      await sendPhotoUrl(chatId, thumbUrl, scriptsCaption(), { reply_markup: buildInlineKeyboard(rows) });
      await clearUserState(userId);
      return;
    }

    // If user is in state waiting for username
    const state = await getUserState(userId);
    if (state?.step === "await_panel_username") {
      const username = text;
      if (!isValidUsername(username)) {
        await sendMessage(chatId, "<b>Username tidak valid</b>\nGunakan huruf/angka/underscore, 3-24 karakter.\nContoh: <code>elaina_panel</code>");
        return;
      }

      await clearUserState(userId);
      await startPaymentFlow({
        chatId,
        userId,
        productCode: "buypanel",
        amount: settings.pricing.buyPanel,
        meta: { egg: state.egg, username },
        baseUrl,
      });
      return;
    }

    if (state?.step === "await_admin_username") {
      const username = text;
      if (!isValidUsername(username)) {
        await sendMessage(chatId, "<b>Username tidak valid</b>\nGunakan huruf/angka/underscore, 3-24 karakter.\nContoh: <code>admin_elaina</code>");
        return;
      }
      await clearUserState(userId);
      await startPaymentFlow({
        chatId,
        userId,
        productCode: "buyadminpanel",
        amount: settings.pricing.buyAdminPanel,
        meta: { username },
        baseUrl,
      });
      return;
    }

    // default fallback
    await sendMessage(chatId, "Pilih menu di keyboard bawah ya 😊\nKetik /menu untuk tampilkan menu lagi.");
    return;
  }

  // CALLBACK
  if (update.callback_query) {
    const cq = update.callback_query;
    const data = normalizeText(cq.data);
    const chatId = cq.message?.chat?.id;
    const userId = cq.from?.id;
    const cqid = cq.id;

    if (cqid) await answerCallbackQuery(cqid);

    if (!chatId || !userId) return;

    if (data === "back:menu") {
      await sendPhotoUrl(chatId, baseUrl + settings.assets.thumbnail, startCaption(settings), { reply_markup: buildReplyKeyboard(settings) });
      await clearUserState(userId);
      return;
    }

    if (data.startsWith("panel_egg:")) {
      const egg = data.split(":")[1];
      if (!["js", "py"].includes(egg)) return;

      await setUserState(userId, { step: "await_panel_username", egg }, 10);
      await sendMessage(chatId, askPanelUsernameCaption());
      return;
    }

    if (data.startsWith("script_buy:")) {
      const scriptId = data.split(":")[1];
      const meta = await getScriptMetaById(scriptId);
      if (!meta || !meta.active) {
        await sendMessage(chatId, "<b>Script tidak ditemukan</b>\nSilakan pilih script lain.");
        return;
      }
      const amount = meta.price ?? settings.pricing.buyScriptDefault;
      await startPaymentFlow({
        chatId,
        userId,
        productCode: "buyscript",
        amount,
        meta: { scriptId: String(meta._id), filename: meta.filename, displayName: meta.displayName, fileId: String(meta.fileId) },
        baseUrl,
      });
      return;
    }
  }
}

async function startPaymentFlow({ chatId, userId, productCode, amount, meta, baseUrl }) {
  const settings = await getRuntimeSettings();

  const pendingPhotoUrl = baseUrl + settings.assets.pending;

  const orderId = newOrderId(userId);

  // Create Pakasir payment (QR string)
  const payment = await pakasirCreateQris(orderId, amount);

  const expiredAt = payment.expired_at ? new Date(payment.expired_at) : null;

  // Create order in DB
  await createOrder({
    orderId,
    userId,
    chatId,
    productCode,
    amount: Number(amount),
    meta,
    pakasir: {
      method: payment.payment_method,
      totalPayment: payment.total_payment,
      fee: payment.fee,
      expiredAt,
    },
    expiredAt,
    paymentStatus: "pending",
  });

  // Step A: pending photo
  const pendingMsg = await sendPhotoUrl(chatId, pendingPhotoUrl, null);

  // Step B: QR image from payment_number
  const qrBuf = await qrisToPngBuffer(payment.payment_number);
  const qrMsg = await sendPhotoBuffer(chatId, qrBuf, `qris-${orderId}.png`, qrisCaption(orderId, amount));

  await updateOrder(orderId, {
    pendingMessageId: pendingMsg?.message_id,
    qrisMessageId: qrMsg?.message_id,
  });
}
