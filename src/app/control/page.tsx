import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { TrendingUp, Users, Clock, AlertCircle, ChevronRight } from "lucide-react";

const PLAN_PRICE: Record<string, number> = {
  STARTER: 499,
  PRO: 999,
  ENTERPRISE: 0,
};

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
    const daysLeft = Math.ceil(
      (new Date(a.trialEndsAt).getTime() - now.getTime()) / 86400000
    );
    return daysLeft >= 0 && daysLeft <= 3;
  });

  const expiredTrials = agencies.filter(
    (a) =>
      a.subStatus === "TRIAL" &&
      a.trialEndsAt &&
      new Date(a.trialEndsAt) < now
  );

  const newThisWeek = agencies.filter(
    (a) => new Date(a.createdAt) > weekAgo
  ).length;

  return (
    <div className="p-8 space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-base opacity-50 mt-1">
          Real-time snapshot of all customers
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Total Accounts"
          value={agencies.length}
          icon={Users}
          iconColor="text-blue-500"
          sub={`${newThisWeek} new this week`}
        />
        <KpiCard
          label="Active Paid"
          value={active.length}
          icon={TrendingUp}
          iconColor="text-green-500"
          sub={`MRR ₹${mrr.toLocaleString("en-IN")}`}
        />
        <KpiCard
          label="On Trial"
          value={trial.length}
          icon={Clock}
          iconColor="text-amber-500"
          sub={`${trialExpiringSoon.length} expiring in 3d`}
        />
        <KpiCard
          label="Churned"
          value={cancelled.length + pastDue.length}
          icon={AlertCircle}
          iconColor="text-red-500"
          sub={`${pastDue.length} past due`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plan breakdown */}
        <div className="bg-current/[0.04] border border-current/10 rounded-2xl p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-5">
            Plan Breakdown
          </h2>
          <div className="space-y-4">
            {[
              { plan: "STARTER", price: "₹499/mo", color: "bg-blue-500" },
              { plan: "PRO", price: "₹999/mo", color: "bg-purple-500" },
              { plan: "ENTERPRISE", price: "Custom", color: "bg-amber-500" },
            ].map(({ plan, price, color }) => {
              const count = agencies.filter((a) => a.plan === plan).length;
              const pct = agencies.length
                ? Math.round((count / agencies.length) * 100)
                : 0;
              return (
                <div key={plan}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-semibold">{plan}</span>
                    <span className="opacity-50 text-xs">
                      {count} accounts · {price}
                    </span>
                  </div>
                  <div className="h-2 bg-current/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 pt-5 border-t border-current/10 flex justify-between text-sm opacity-40">
            <span>Total clients: {totalClients}</span>
            <span>Total posts: {totalPosts}</span>
          </div>
        </div>

        {/* Needs attention */}
        <div className="bg-current/[0.04] border border-current/10 rounded-2xl p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-5">
            Needs Attention
          </h2>
          {trialExpiringSoon.length === 0 &&
          expiredTrials.length === 0 &&
          pastDue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 opacity-30">
              <p className="text-sm font-medium">All clear — nothing urgent.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expiredTrials.map((a) => (
                <AttentionRow
                  key={a.id}
                  id={a.id}
                  name={a.name}
                  email={a.user.email ?? ""}
                  tag="Trial expired"
                  tagStyle="bg-red-500/10 text-red-600"
                />
              ))}
              {trialExpiringSoon.map((a) => {
                const days = Math.ceil(
                  (new Date(a.trialEndsAt!).getTime() - now.getTime()) /
                    86400000
                );
                return (
                  <AttentionRow
                    key={a.id}
                    id={a.id}
                    name={a.name}
                    email={a.user.email ?? ""}
                    tag={`Trial ends in ${days}d`}
                    tagStyle="bg-amber-500/10 text-amber-600"
                  />
                );
              })}
              {agencies
                .filter((a) => a.subStatus === "PAST_DUE")
                .map((a) => (
                  <AttentionRow
                    key={a.id}
                    id={a.id}
                    name={a.name}
                    email={a.user.email ?? ""}
                    tag="Past due"
                    tagStyle="bg-orange-500/10 text-orange-600"
                  />
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent sign-ups */}
      <div className="bg-current/[0.04] border border-current/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-current/10 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest opacity-40">
            Recent Sign-ups
          </h2>
          <Link
            href="/control/agencies"
            className="text-sm text-brand hover:text-brand-deep font-semibold transition-colors"
          >
            View all →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-current/[0.06]">
              {["Agency", "Email", "Plan", "Status", "Joined"].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-bold uppercase tracking-widest opacity-40 px-6 py-3.5"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-current/[0.04]">
            {agencies.slice(0, 10).map((a) => (
              <tr key={a.id} className="hover:bg-current/[0.02] transition-colors">
                <td className="px-6 py-3.5">
                  <Link
                    href={`/control/agencies/${a.id}`}
                    className="font-semibold hover:text-brand transition-colors flex items-center gap-1 group"
                  >
                    {a.name}
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </td>
                <td className="px-6 py-3.5 text-sm opacity-50">{a.user.email}</td>
                <td className="px-6 py-3.5">
                  <PlanBadge plan={a.plan} />
                </td>
                <td className="px-6 py-3.5">
                  <StatusBadge status={a.subStatus} />
                </td>
                <td className="px-6 py-3.5 text-xs opacity-40">
                  {new Date(a.createdAt).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  iconColor,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconColor: string;
  sub: string;
}) {
  return (
    <div className="bg-current/[0.04] border border-current/10 rounded-2xl p-5">
      <Icon className={`w-5 h-5 ${iconColor} mb-3`} />
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      <p className="text-sm font-semibold mt-1">{label}</p>
      <p className="text-xs opacity-40 mt-0.5">{sub}</p>
    </div>
  );
}

function AttentionRow({
  id,
  name,
  email,
  tag,
  tagStyle,
}: {
  id: string;
  name: string;
  email: string;
  tag: string;
  tagStyle: string;
}) {
  return (
    <Link
      href={`/control/agencies/${id}`}
      className="flex items-center justify-between p-3 bg-current/[0.03] hover:bg-current/[0.06] rounded-xl transition-colors"
    >
      <div>
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-xs opacity-40 mt-0.5">{email}</p>
      </div>
      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${tagStyle}`}>
        {tag}
      </span>
    </Link>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const c: Record<string, string> = {
    STARTER: "text-blue-600",
    PRO: "text-purple-600",
    ENTERPRISE: "text-amber-600",
  };
  return (
    <span className={`text-xs font-bold ${c[plan] ?? "opacity-50"}`}>{plan}</span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = {
    ACTIVE: "bg-green-500/10 text-green-600",
    TRIAL: "bg-amber-500/10 text-amber-600",
    PAST_DUE: "bg-orange-500/10 text-orange-600",
    CANCELLED: "bg-red-500/10 text-red-600",
  };
  return (
    <span
      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
        s[status] ?? "bg-gray-500/10 opacity-50"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
