import config from "../config.js";
import { getDb } from "./mongo.js";

let cache = { at: 0, value: null };
const TTL_MS = 10_000;

export async function getRuntimeSettings() {
  const now = Date.now();
  if (cache.value && now - cache.at < TTL_MS) return cache.value;

  let dbSettings = null;
  try {
    const db = await getDb();
    dbSettings = await db.collection("settings").findOne({ _id: "settings" });
  } catch {
    // DB not available yet; fallback to config-only
  }

  const merged = {
    ...config,
    // allow overrides
    app: { ...config.app, ...(dbSettings?.app || {}) },
    pricing: { ...config.pricing, ...(dbSettings?.pricing || {}) },
    reseller: { ...config.reseller, ...(dbSettings?.reseller || {}) },
    pakasir: { ...config.pakasir, ...(dbSettings?.pakasir || {}) },
    pterodactyl: { ...config.pterodactyl, ...(dbSettings?.pterodactyl || {}) },
    digitalocean: { ...config.digitalocean, ...(dbSettings?.digitalocean || {}) },
    assets: { ...config.assets, ...(dbSettings?.assets || {}) },
    botUI: { ...config.botUI, ...(dbSettings?.botUI || {}) },
    // baseUrl override:
    baseUrl: dbSettings?.baseUrl || null,
  };

  cache = { at: now, value: merged };
  return merged;
}

export function inferBaseUrlFromHeaders(headers, settings) {
  // Priority: DB override -> VERCEL_URL -> request headers -> localhost
  if (settings?.baseUrl) return settings.baseUrl;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const proto = headers.get("x-forwarded-proto") || "http";
  const host = headers.get("x-forwarded-host") || headers.get("host");
  if (host) return `${proto}://${host}`;
  return "http://localhost:3000";
}
