import { cookies } from "next/headers";
import { verifyAdminSession } from "./auth.js";

export function requireAdmin() {
  const c = cookies().get("admin_session")?.value;
  const session = verifyAdminSession(c);
  if (!session) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
  return session;
}
