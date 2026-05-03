"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Zap,
  LayoutDashboard,
  Users,
  Calendar,
  ListChecks,
  Settings,
  LogOut,
  ChevronRight,
  Plus,
  Clock,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/clients", icon: Users, label: "Clients" },
  { href: "/calendar", icon: Calendar, label: "Calendar" },
  { href: "/queue", icon: ListChecks, label: "Review Queue" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

function TrialBadge({
  trialEndsAt,
  plan,
  subStatus,
}: {
  trialEndsAt?: string | null;
  plan?: string;
  subStatus?: string;
}) {
  if (subStatus === "ACTIVE") {
    return (
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 mb-3">
        <p className="text-xs font-semibold text-brand mb-0.5">
          {plan === "PRO" ? "Pro Plan" : "Starter Plan"}
        </p>
        <p className="text-xs text-muted">
          {plan === "PRO" ? "10 clients · 300 posts/mo" : "3 clients · 90 posts/mo"}
        </p>
        <Link
          href="/settings"
          className="text-xs font-semibold text-brand hover:underline mt-2 inline-block"
        >
          {plan === "PRO" ? "Manage plan →" : "Upgrade to Pro →"}
        </Link>
      </div>
    );
  }

  // Trial state
  const daysLeft = trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      )
    : 7;

  return (
    <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 mb-3">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Clock className="w-3 h-3 text-brand" />
        <p className="text-xs font-semibold text-brand">
          {daysLeft} day{daysLeft !== 1 ? "s" : ""} left in trial
        </p>
      </div>
      <p className="text-xs text-muted">3 clients · 90 posts/mo</p>
      <Link
        href="/settings"
        className="text-xs font-semibold text-brand hover:underline mt-2 inline-block"
      >
        Upgrade now →
      </Link>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const firstName = session?.user?.name?.split(" ")[0] ?? "Agency";
  const agencyName = session?.user?.agencyName ?? "My Agency";
  const initials = agencyName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* ═══ SIDEBAR ═══ */}
      <aside className="w-[260px] bg-surface border-r border-[var(--color-border)] flex flex-col fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[var(--color-border)]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              AutoDocks
            </span>
          </Link>
        </div>

        {/* Quick Action */}
        <div className="px-4 pt-5 pb-2">
          <Link
            href="/clients/new"
            className="flex items-center justify-center gap-2 bg-brand text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-brand-deep transition-colors w-full"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-brand-50 text-brand border border-brand-100"
                    : "text-muted hover:bg-surface-warm hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "w-[18px] h-[18px]",
                    isActive ? "text-brand" : "text-muted-fg group-hover:text-muted"
                  )}
                />
                {item.label}
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-brand/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[var(--color-border)] p-4">
          <TrialBadge
            trialEndsAt={session?.user?.trialEndsAt}
            plan={session?.user?.plan}
            subStatus={session?.user?.subStatus}
          />

          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={firstName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-white">{initials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{firstName}</p>
              <p className="text-xs text-muted-fg truncate">{agencyName}</p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:bg-surface-warm hover:text-foreground transition-all w-full"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 ml-[260px]">
        <div className="p-8 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
