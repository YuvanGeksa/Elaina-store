import crypto from "crypto";
import config from "../config.js";

function hmac(data) {
  return crypto.createHmac("sha256", config.admin.sessionSecret).update(data).digest("base64url");
}

export function signAdminSession(payloadObj) {
  const payload = Buffer.from(JSON.stringify(payloadObj), "utf8").toString("base64url");
  const sig = hmac(payload);
  return `${payload}.${sig}`;
}

export function verifyAdminSession(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = hmac(payload);
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

  try {
    const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    // Basic sanity:
    if (!json || json.u !== config.admin.username) return null;
    return json;
  } catch {
    return null;
  }
}
