import { requireAdmin } from "../../../../lib/adminGuard.js";
import { getDb } from "../../../../lib/mongo.js";
import { getRuntimeSettings } from "../../../../lib/runtimeSettings.js";

export const runtime = "nodejs";

export async function GET() {
  requireAdmin();
  const settings = await getRuntimeSettings();
  return Response.json({ pricing: settings.pricing });
}

export async function PUT(req) {
  requireAdmin();
  const body = await req.json().catch(() => null);
  const pricing = body?.pricing;
  if (!pricing) return Response.json({ error: "Missing pricing" }, { status: 400 });

  const db = await getDb();
  await db.collection("settings").updateOne(
    { _id: "settings" },
    { $set: { pricing } },
    { upsert: true }
  );

  return Response.json({ ok: true });
}
