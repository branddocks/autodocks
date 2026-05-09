import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If authenticated user hits /login or /signup, redirect to dashboard
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (token && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;

        // Public routes — always allow
        const publicPaths = ["/", "/login", "/signup", "/api/auth", "/approve", "/api/approve"];
        if (publicPaths.some((p) => pathname.startsWith(p))) return true;

        // Everything else requires auth
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all routes EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (svg, png, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
