import { prisma } from "@/lib/prisma";
import Link from "next/link";

const PLAN_PRICE: Record<string, number> = { STARTER: 499, PRO: 999, ENTERPRISE: 0 };

export default async function AdminOverviewPage() {
  const [agencies, totalClients, totalPosts] = await Promise.all([
    prisma.agency.findMany({
      include: {
        user: { select: { email: true, name: true } },
        _count: { select: { clients: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.count(),
    prisma.post.count(),
  ]);

  const active = agencies.filter((a) => a.subStatus === "ACTIVE");
  const trial = agencies.filter((a) => a.subStatus === "TRIAL");
  const cancelled = agencies.filter((a) => a.subStatus === "CANCELLED");
  const pastDue = agencies.filter((a) => a.subStatus === "PAST_DUE");

  const mrr = active.reduce((sum, a) => sum + (PLAN_PRICE[a.plan] ?? 0), 0);

  const stats = [
    { label: "Total Agencies", value: agencies.length, color: "text-blue-400" },
    { label: "Active", value: active.length, color: "text-green-400" },
    { label: "Trial", value: trial.length, color: "text-yellow-400" },
    { label: "Cancelled", value: cancelled.length, color: "text-red-400" },
    { label: "Past Due", value: pastDue.length, color: "text-orange-400" },
    { label: "Total Clients", value: totalClients, color: "text-purple-400" },
    { label: "Total Posts", value: totalPosts, color: "text-pink-400" },
    { label: "MRR (₹)", value: `₹${mrr.toLocaleString("en-IN")}`, color: "text-emerald-400" },
  ];

  // Recent signups (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentSignups = agencies.filter((a) => new Date(a.createdAt) > weekAgo);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Everything across all accounts</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent signups */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
          New This Week ({recentSignups.length})
        </h2>
        {recentSignups.length === 0 ? (
          <p className="text-gray-500 text-sm">No new signups this week.</p>
        ) : (
          <div className="space-y-2">
            {recentSignups.map((a) => (
              <Link
                key={a.id}
                href={`/admin/agencies/${a.id}`}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-white">{a.name}</p>
                  <p className="text-xs text-gray-400">{a.user.email}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={a.subStatus} />
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(a.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Plan breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
          Plan Breakdown
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {(["STARTER", "PRO", "ENTERPRISE"] as const).map((plan) => {
            const count = agencies.filter((a) => a.plan === plan).length;
            return (
              <div key={plan} className="text-center">
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-xs text-gray-400 mt-1">{plan}</p>
                <p className="text-xs text-gray-500">
                  {plan !== "ENTERPRISE" ? `₹${PLAN_PRICE[plan]}/mo` : "Custom"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-900 text-green-300",
    TRIAL: "bg-yellow-900 text-yellow-300",
    PAST_DUE: "bg-orange-900 text-orange-300",
    CANCELLED: "bg-red-900 text-red-300",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] ?? "bg-gray-700 text-gray-300"}`}>
      {status}
    </span>
  );
}
