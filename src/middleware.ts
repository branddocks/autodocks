import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { ADMIN_EMAIL } from "@/lib/admin";

function isTrialExpired(token: { subStatus?: string; trialEndsAt?: string | null } | null): boolean {
  if (!token) return false;
  if (token.subStatus !== "TRIAL") return false;
  if (!token.trialEndsAt) return false;
  return new Date(token.trialEndsAt) < new Date();
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const host = req.headers.get("host") ?? "";

    // ── Subdomain routing: admin.branddocks.com ──────────────────────────────
    // If the request is coming from the admin subdomain, rewrite to /control/*
    const isAdminSubdomain =
      host === "admin.branddocks.com" || host.startsWith("admin.branddocks.com:");

    if (isAdminSubdomain) {
      // /login on admin subdomain → /control/login
      if (pathname === "/login" || pathname === "/") {
        if (!token) {
          return NextResponse.rewrite(new URL("/control/login", req.url));
        }
        // Already logged in → go to control panel
        return NextResponse.redirect(new URL("/control", req.url));
      }
      // All other paths on admin subdomain flow normally through /control/*
    }

    // ── Redirect admin email away from regular dashboard ────────────────────
    if (token?.email === ADMIN_EMAIL) {
      // Admin hitting / or /dashboard → send to control panel
      if (pathname === "/" || pathname === "/dashboard") {
        return NextResponse.redirect(new URL("/control", req.url));
      }
      // Admin hitting /login or /signup → send to control
      if (pathname === "/login" || pathname === "/signup") {
        return NextResponse.redirect(new URL("/control", req.url));
      }
    }

    // ── Non-admin hitting /control/* → redirect to dashboard ────────────────
    if (pathname.startsWith("/control") && pathname !== "/control/login") {
      if (!token) {
        return NextResponse.redirect(new URL("/control/login", req.url));
      }
      if (token.email !== ADMIN_EMAIL) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // ── /admin/* (old panel) — also restricted to admin ─────────────────────
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (!token || token.email !== ADMIN_EMAIL) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // ── Normal users: redirect away from login if already authed ────────────
    if (token && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // ── Trial expiry gate ────────────────────────────────────────────────────
    // If the trial has expired, only allow /settings (to subscribe) and /pricing.
    // Block all other authenticated dashboard routes until they pick a plan.
    if (token && isTrialExpired(token as { subStatus?: string; trialEndsAt?: string | null })) {
      const allowedOnExpiry = ["/settings", "/pricing", "/api/razorpay", "/api/auth", "/api/webhooks"];
      const isAllowed = allowedOnExpiry.some((p) => pathname.startsWith(p));
      if (!isAllowed && !pathname.startsWith("/control") && !pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/settings?expired=1", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;

        // Public routes — always allow
        const publicPaths = [
          "/", "/login", "/signup", "/pricing",
          "/api/auth", "/approve", "/api/approve",
          "/control/login",
          "/api/webhooks", // Razorpay webhooks must be unauthenticated
        ];
        if (publicPaths.some((p) => pathname.startsWith(p))) return true;

        // Everything else requires auth
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
