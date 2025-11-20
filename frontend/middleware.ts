// // middleware.ts


import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const ROUTE_PERMISSIONS = {
  PUBLIC: ["/", "/login", "/register", "/about", "/pricing"],
  AUTHENTICATED: ["/dashboard", "/profile", "/settings"],
  ADMIN: ["/admin"],
  CONTRIBUTOR: ["/admin/content", "/admin/moderation"],
} as const;

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const pathMatches = (patterns: readonly string[]) =>
    patterns.some((pattern) => pathname.startsWith(pattern));

  // Public routes - allow access
  if (pathMatches(ROUTE_PERMISSIONS.PUBLIC)) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token) {
    if (
      pathMatches([
        ...ROUTE_PERMISSIONS.AUTHENTICATED,
        ...ROUTE_PERMISSIONS.ADMIN,
        ...ROUTE_PERMISSIONS.CONTRIBUTOR,
      ])
    ) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ✅ Get numeric role (now stored as number)
  const userRole = (token as any).role ?? 2
  const userRoleLevel = typeof userRole === 'number' ? userRole : 2

  // Admin routes - require admin role (level 4)
  if (pathMatches(ROUTE_PERMISSIONS.ADMIN)) {
    if (userRoleLevel < 4) {
      return NextResponse.redirect(
       new URL("/admin/login?error=insufficient_privileges", req.url)
      );
    }
  }

  // Contributor routes - require contributor or higher (level 3+)
  if (pathMatches(ROUTE_PERMISSIONS.CONTRIBUTOR)) {
    if (userRoleLevel < 3) {
      return NextResponse.redirect(
        new URL("/unauthorized?reason=contributor_required", req.url)
      );
    }
  }

  // Add user info to headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-email", (token.email as string) ?? "");
  requestHeaders.set("x-user-role", userRoleLevel.toString());

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)",
  ],
};

