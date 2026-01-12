import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET() {
  cookies().set("admin_session", "", { httpOnly: true, path: "/", maxAge: 0 });
  return new Response(null, {
    status: 302,
    headers: { Location: "/admin/login" },
  });
}
