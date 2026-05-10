import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";
import { headers } from "next/headers";

export default async function ControlLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Not logged in → go to control login
  if (!session?.user?.email) {
    redirect("/control/login");
  }

  // Logged in but not admin → bounce
  if (!isAdmin(session.user.email)) {
    redirect("/dashboard");
  }

  const headersList = headers();
  const host = headersList.get("host") ?? "";
  const isSubdomain = host.startsWith("admin.");

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white flex">
      {/* Sidebar */}
      <aside className="w-60 bg-[#111114] border-r border-white/5 flex flex-col py-6 px-4 flex-shrink-0">
        {/* Brand */}
        <div className="px-2 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">A</span>
            </div>
            <span className="text-white font-bold text-base">AutoDocks</span>
          </div>
          <div className="ml-9 text-[10px] text-red-400 font-semibold uppercase tracking-widest">
            Admin Control
          </div>
        </div>

        <nav className="flex flex-col gap-0.5">
          <SidebarLink href="/control" icon="📊">Overview</SidebarLink>
          <SidebarLink href="/control/agencies" icon="👥">All Customers</SidebarLink>
        </nav>

        <div className="mt-auto border-t border-white/5 pt-4 space-y-1">
          <div className="px-3 py-1.5">
            <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            <p className="text-[10px] text-green-500 font-semibold mt-0.5">● Super Admin</p>
          </div>
          {!isSubdomain && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              ← Back to App
            </Link>
          )}
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

function SidebarLink({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-colors"
    >
      <span className="text-base">{icon}</span>
      {children}
    </Link>
  );
}
