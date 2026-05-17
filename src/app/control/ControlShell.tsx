"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Zap,
  Moon,
  Sun,
  ExternalLink,
} from "lucide-react";

export function ControlShell({
  children,
  email,
  isSubdomain,
}: {
  children: React.ReactNode;
  email: string;
  isSubdomain: boolean;
}) {
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("ctrl-theme");
    if (saved === "light") setDark(false);
    if (saved === "dark") setDark(true);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("ctrl-theme", next ? "dark" : "light");
  };

  // Avoid hydration mismatch — render dark until mounted
  const isDark = mounted ? dark : true;

  const bg = isDark ? "bg-[#0d0d0f]" : "bg-gray-50";
  const sb = isDark
    ? "bg-[#111114] border-white/5 text-white"
    : "bg-white border-gray-200 text-gray-900";
  const muted = isDark ? "text-gray-400" : "text-gray-500";
  const hover = isDark
    ? "text-gray-400 hover:text-white hover:bg-white/5"
    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100";
  const divider = isDark ? "border-white/5" : "border-gray-200";
  const footerBg = isDark ? "bg-white/[0.04]" : "bg-gray-100";

  return (
    <div className={`min-h-screen ${bg} flex`}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`w-64 ${sb} border-r flex flex-col py-6 px-4 flex-shrink-0 fixed inset-y-0 left-0 z-40`}
      >
        {/* Brand */}
        <div className="px-2 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand rounded-2xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-base leading-none">AutoDocks</p>
              <p className="text-[11px] text-red-500 font-bold tracking-wider mt-0.5">
                ADMIN PANEL
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          <SidebarLink href="/control" icon={LayoutDashboard} label="Overview" className={hover} />
          <SidebarLink href="/control/agencies" icon={Users} label="All Customers" className={hover} />
        </nav>

        {/* Footer */}
        <div className={`border-t ${divider} pt-4 space-y-1`}>
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${hover}`}
          >
            {isDark ? (
              <Sun className="w-4 h-4 flex-shrink-0" />
            ) : (
              <Moon className="w-4 h-4 flex-shrink-0" />
            )}
            {isDark ? "Light mode" : "Dark mode"}
          </button>

          {/* Back to app — /dashboard redirects admin back to /control,
              so link to /clients which the middleware doesn't intercept */}
          <Link
            href="/clients"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${hover}`}
          >
            <ExternalLink className="w-4 h-4 flex-shrink-0" />
            Back to App
          </Link>

          {/* User card */}
          <div className={`px-3 py-3 rounded-xl ${footerBg} mt-1`}>
            <p className="text-sm font-semibold truncate">{email}</p>
            <p className="text-xs text-green-500 font-bold mt-0.5">● Super Admin</p>
          </div>

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: "/control/login" })}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${hover}`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────── */}
      <main className={`flex-1 ml-64 overflow-y-auto min-h-screen ${isDark ? "text-white" : "text-gray-900"}`}>
        {children}
      </main>
    </div>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  className,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  className: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${className}`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
    </Link>
  );
}
