import { requireAdmin } from "../../../../lib/adminGuard.js";
import { listScripts, uploadScriptZip, deleteScript } from "../../../../lib/scripts.js";

export const runtime = "nodejs";

export async function GET() {
  requireAdmin();
  const scripts = await listScripts().catch(() => []);
  return Response.json({ scripts });
}

export async function POST(req) {
  requireAdmin();
  try {
    const form = await req.formData();
    const file = form.get("file");
    const displayName = String(form.get("displayName") || "");
    const price = String(form.get("price") || "");

    if (!file || typeof file === "string") {
      return Response.json({ error: "File tidak valid" }, { status: 400 });
    }

    const filename = file.name || "script.zip";
    if (!filename.toLowerCase().endsWith(".zip")) {
      return Response.json({ error: "Hanya menerima file .zip" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.length > 25 * 1024 * 1024) {
      return Response.json({ error: "File terlalu besar (max 25MB)" }, { status: 400 });
    }

    const saved = await uploadScriptZip({
      filename,
      displayName,
      price: price ? Number(price) : null,
      buffer: buf,
    });

    return Response.json({ ok: true, script: saved });
  } catch (e) {
    console.error("upload script error:", e);
    return Response.json({ error: "Upload gagal" }, { status: 500 });
  }
}

export async function DELETE(req) {
  requireAdmin();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  await deleteScript(id);
  return Response.json({ ok: true });
}
