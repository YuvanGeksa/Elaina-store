import { cookies } from "next/headers";
import config from "../../../../config.js";
import { signAdminSession } from "../../../../lib/auth.js";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const username = body?.username || "";
    const password = body?.password || "";

    if (username !== config.admin.username || password !== config.admin.password) {
      return Response.json({ error: "Username/password salah" }, { status: 401 });
    }

    const token = signAdminSession({ u: config.admin.username, iat: Date.now() });
    cookies().set("admin_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
}
