import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Route-level protection for dashboard areas. Confirms a session exists and
 * that the role matches the area. Fine-grained authz still happens in each
 * route handler / service (defense in depth — see docs/SECURITY.md §3).
 */
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    const areaRole: Record<string, string[]> = {
      "/student": ["student"],
      "/agent": ["agent"],
      "/admin": ["agency_admin", "super_admin"],
    };

    for (const [prefix, roles] of Object.entries(areaRole)) {
      if (pathname.startsWith(prefix) && role && !roles.includes(role)) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
    pages: { signIn: "/login" },
  },
);

export const config = {
  matcher: ["/student/:path*", "/agent/:path*", "/admin/:path*"],
};
