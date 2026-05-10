import { prisma } from "@/lib/prisma";
import Link from "next/link";

const PLAN_PRICE: Record<string, number> = { STARTER: 499, PRO: 999, ENTERPRISE: 0 };

export default async function ControlOverviewPage() {
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

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const trialExpiringSoon = agencies.filter((a) => {
    if (a.subStatus !== "TRIAL" || !a.trialEndsAt) return false;
    const daysLeft = Math.ceil((new Date(a.trialEndsAt).getTime() - now.getTime()) / 86400000);
    return daysLeft >= 0 && daysLeft <= 3;
  });
  const expiredTrials = agencies.filter(
    (a) => a.subStatus === "TRIAL" && a.trialEndsAt && new Date(a.trialEndsAt) < now
  );

  return (
    <div className="p-8 space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time snapshot of all customers</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Accounts" value={agencies.length} color="text-blue-400" sub={`${agencies.filter(a => new Date(a.createdAt) > weekAgo).length} new this week`} />
        <KpiCard label="Active Paid" value={active.length} color="text-green-400" sub={`MRR ₹${mrr.toLocaleString("en-IN")}`} />
        <KpiCard label="On Trial" value={trial.length} color="text-yellow-400" sub={`${trialExpiringSoon.length} expiring in 3d`} />
        <KpiCard label="Churned" value={cancelled.length + pastDue.length} color="text-red-400" sub={`${pastDue.length} past due`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plan breakdown */}
        <div className="bg-[#111114] border border-white/5 rounded-2xl p-6">
          <h2 className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-4">Plan Breakdown</h2>
          <div className="space-y-3">
            {[
              { plan: "STARTER", price: "₹499/mo", color: "bg-blue-500" },
              { plan: "PRO", price: "₹999/mo", color: "bg-purple-500" },
              { plan: "ENTERPRISE", price: "Custom", color: "bg-yellow-500" },
            ].map(({ plan, price, color }) => {
              const count = agencies.filter((a) => a.plan === plan).length;
              const pct = agencies.length ? Math.round((count / agencies.length) * 100) : 0;
              return (
                <div key={plan}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 font-medium">{plan}</span>
                    <span className="text-gray-500">{count} accounts · {price}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs text-gray-500">
            <span>Total clients: {totalClients}</span>
            <span>Total posts: {totalPosts}</span>
          </div>
        </div>

        {/* Attention needed */}
        <div className="bg-[#111114] border border-white/5 rounded-2xl p-6">
          <h2 className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-4">
            Needs Attention
          </h2>
          {trialExpiringSoon.length === 0 && expiredTrials.length === 0 && pastDue.length === 0 ? (
            <p className="text-gray-600 text-sm">All clear — nothing urgent.</p>
          ) : (
            <div className="space-y-2">
              {expiredTrials.map((a) => (
                <AttentionRow key={a.id} id={a.id} name={a.name} email={a.user.email ?? ""} tag="Trial expired" tagColor="bg-red-900/50 text-red-400" />
              ))}
              {trialExpiringSoon.map((a) => {
                const days = Math.ceil((new Date(a.trialEndsAt!).getTime() - now.getTime()) / 86400000);
                return (
                  <AttentionRow key={a.id} id={a.id} name={a.name} email={a.user.email ?? ""} tag={`Trial ends in ${days}d`} tagColor="bg-yellow-900/50 text-yellow-400" />
                );
              })}
              {agencies.filter((a) => a.subStatus === "PAST_DUE").map((a) => (
                <AttentionRow key={a.id} id={a.id} name={a.name} email={a.user.email ?? ""} tag="Past due" tagColor="bg-orange-900/50 text-orange-400" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent customers */}
      <div className="bg-[#111114] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Recent Sign-ups</h2>
          <Link href="/control/agencies" className="text-xs text-brand hover:text-brand-deep font-medium">
            View all →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {["Agency", "Email", "Plan", "Status", "Joined"].map((h) => (
                <th key={h} className="text-left text-[11px] text-gray-600 uppercase tracking-wider px-6 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {agencies.slice(0, 10).map((a) => (
              <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-3">
                  <Link href={`/control/agencies/${a.id}`} className="font-medium text-white hover:text-brand transition-colors">
                    {a.name}
                  </Link>
                </td>
                <td className="px-6 py-3 text-gray-400 text-xs">{a.user.email}</td>
                <td className="px-6 py-3"><PlanBadge plan={a.plan} /></td>
                <td className="px-6 py-3"><StatusBadge status={a.subStatus} /></td>
                <td className="px-6 py-3 text-gray-600 text-xs">{new Date(a.createdAt).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KpiCard({ label, value, color, sub }: { label: string; value: number | string; color: string; sub: string }) {
  return (
    <div className="bg-[#111114] border border-white/5 rounded-2xl p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-3xl font-bold ${color} mb-1`}>{value}</p>
      <p className="text-xs text-gray-600">{sub}</p>
    </div>
  );
}

function AttentionRow({ id, name, email, tag, tagColor }: { id: string; name: string; email: string; tag: string; tagColor: string }) {
  return (
    <Link href={`/control/agencies/${id}`} className="flex items-center justify-between p-3 bg-white/[0.03] hover:bg-white/[0.05] rounded-xl transition-colors">
      <div>
        <p className="text-sm font-medium text-white">{name}</p>
        <p className="text-xs text-gray-500">{email}</p>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagColor}`}>{tag}</span>
    </Link>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const c: Record<string, string> = { STARTER: "text-blue-400", PRO: "text-purple-400", ENTERPRISE: "text-yellow-400" };
  return <span className={`text-xs font-semibold ${c[plan] ?? "text-gray-400"}`}>{plan}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = { ACTIVE: "bg-green-900/40 text-green-400", TRIAL: "bg-yellow-900/40 text-yellow-400", PAST_DUE: "bg-orange-900/40 text-orange-400", CANCELLED: "bg-red-900/40 text-red-400" };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s[status] ?? "bg-gray-800 text-gray-400"}`}>{status}</span>;
}
