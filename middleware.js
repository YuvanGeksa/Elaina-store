import { NextResponse } from "next/server";

const ADMIN_PATHS = ["/admin", "/api/admin"];

function isProtected(pathname) {
  return ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function middleware(req) {
  const { pathname } = req.nextUrl;

  if (!isProtected(pathname)) return NextResponse.next();

  // Allow login endpoint and login page
  if (pathname === "/admin/login" || pathname === "/api/admin/login") return NextResponse.next();

  const cookie = req.cookies.get("admin_session")?.value;
  if (!cookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // We can't verify crypto signature inside middleware reliably in edge runtime without extra config.
  // So we just check presence here, and do strict verification server-side in API routes.
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
