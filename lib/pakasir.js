import { getRuntimeSettings } from "./runtimeSettings.js";

export async function pakasirCreateQris(orderId, amount) {
  const settings = await getRuntimeSettings();
  const url = "https://app.pakasir.com/api/transactioncreate/qris";
  const body = {
    project: settings.pakasir.slug,
    order_id: orderId,
    amount: Number(amount),
    api_key: settings.pakasir.apiKey,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.payment) {
    throw new Error(`Pakasir transactioncreate error: ${JSON.stringify(json)}`);
  }
  return json.payment; // {payment_number, total_payment, expired_at, ...}
}

export async function pakasirTransactionDetail(orderId, amount) {
  const settings = await getRuntimeSettings();
  const qs = new URLSearchParams({
    project: settings.pakasir.slug,
    amount: String(amount),
    order_id: orderId,
    api_key: settings.pakasir.apiKey,
  });
  const url = `https://app.pakasir.com/api/transactiondetail?${qs.toString()}`;
  const res = await fetch(url, { method: "GET" });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.transaction) {
    throw new Error(`Pakasir transactiondetail error: ${JSON.stringify(json)}`);
  }
  return json.transaction; // {status, ...}
}
