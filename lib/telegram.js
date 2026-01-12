import config from "../config.js";

function apiUrl(token, method) {
  return `https://api.telegram.org/bot${token}/${method}`;
}

async function tgCall(method, payload, opts = {}) {
  const token = opts.token || config.telegram.botToken;
  const url = apiUrl(token, method);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => null);
  if (!json?.ok) {
    const msg = json?.description || `Telegram API error on ${method}`;
    throw new Error(msg);
  }
  return json.result;
}

async function tgCallForm(method, formData, opts = {}) {
  const token = opts.token || config.telegram.botToken;
  const url = apiUrl(token, method);
  const res = await fetch(url, { method: "POST", body: formData });
  const json = await res.json().catch(() => null);
  if (!json?.ok) {
    const msg = json?.description || `Telegram API error on ${method}`;
    throw new Error(msg);
  }
  return json.result;
}

export async function answerCallbackQuery(callback_query_id) {
  try {
    await tgCall("answerCallbackQuery", { callback_query_id });
  } catch {
    // ignore
  }
}

export async function sendMessage(chat_id, text, extra = {}) {
  return tgCall("sendMessage", {
    chat_id,
    text,
    parse_mode: extra.parse_mode || "HTML",
    disable_web_page_preview: true,
    reply_markup: extra.reply_markup,
  });
}

export async function sendPhotoUrl(chat_id, photoUrl, caption, extra = {}) {
  return tgCall("sendPhoto", {
    chat_id,
    photo: photoUrl,
    caption: caption || undefined,
    parse_mode: extra.parse_mode || "HTML",
    reply_markup: extra.reply_markup,
  });
}

export async function sendPhotoBuffer(chat_id, buffer, filename, caption, extra = {}) {
  const fd = new FormData();
  fd.append("chat_id", String(chat_id));
  if (caption) fd.append("caption", caption);
  fd.append("parse_mode", extra.parse_mode || "HTML");
  if (extra.reply_markup) fd.append("reply_markup", JSON.stringify(extra.reply_markup));
  const blob = new Blob([buffer], { type: "image/png" });
  fd.append("photo", blob, filename || "photo.png");
  return tgCallForm("sendPhoto", fd);
}

export async function sendDocumentBuffer(chat_id, buffer, filename, caption, extra = {}) {
  const fd = new FormData();
  fd.append("chat_id", String(chat_id));
  if (caption) fd.append("caption", caption);
  fd.append("parse_mode", extra.parse_mode || "HTML");
  if (extra.reply_markup) fd.append("reply_markup", JSON.stringify(extra.reply_markup));
  const blob = new Blob([buffer], { type: "application/zip" });
  fd.append("document", blob, filename || "file.zip");
  return tgCallForm("sendDocument", fd);
}

export async function deleteMessage(chat_id, message_id) {
  try {
    await tgCall("deleteMessage", { chat_id, message_id });
    return true;
  } catch {
    return false;
  }
}

export function buildReplyKeyboard(settings) {
  const ui = settings.botUI;
  return {
    keyboard: [
      [{ text: ui.btnBuyPanel }, { text: ui.btnBuyAdmin }],
      [{ text: ui.btnBuyReseller }, { text: ui.btnBuyScript }],
    ],
    resize_keyboard: true,
    selective: false,
  };
}

export function buildInlineKeyboard(buttonRows) {
  return { inline_keyboard: buttonRows };
}
