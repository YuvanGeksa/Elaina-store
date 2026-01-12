import { requireAdmin } from "../../../../lib/adminGuard.js";
import { getDb } from "../../../../lib/mongo.js";
import config from "../../../../config.js";
import { getRuntimeSettings } from "../../../../lib/runtimeSettings.js";

export const runtime = "nodejs";

export async function GET() {
  requireAdmin();
  const settings = await getRuntimeSettings();
  return Response.json({
    app: settings.app,
    reseller: settings.reseller,
    baseUrl: settings.baseUrl || "",
    core: {
      telegramToken: config.telegram.botToken,
      pakasirSlug: config.pakasir.slug,
      pakasirApiKey: config.pakasir.apiKey,
      pteroUrl: config.pterodactyl.panelUrl,
    },
  });
}

export async function PUT(req) {
  requireAdmin();
  const body = await req.json().catch(() => null);
  const app = body?.app;
  const reseller = body?.reseller;
  const baseUrl = body?.baseUrl;

  const db = await getDb();
  await db.collection("settings").updateOne(
    { _id: "settings" },
    { $set: { app, reseller, baseUrl } },
    { upsert: true }
  );

  return Response.json({ ok: true });
}
