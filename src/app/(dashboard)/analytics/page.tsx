import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BarChart2,
  CheckCircle2,
  Send,
  XCircle,
  FileText,
  TrendingUp,
  ChevronDown,
} from "lucide-react";

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getClients(agencyId: string) {
  return prisma.client.findMany({
    where: { agencyId, isActive: true },
    select: { id: true, businessName: true, niche: true },
    orderBy: { createdAt: "asc" },
  });
}

async function getAnalytics(agencyId: string, clientId: string) {
  const client = await prisma.client.findFirst({
    where: { id: clientId, agencyId, isActive: true },
    select: { id: true, businessName: true, niche: true },
  });
  if (!client) return null;

  const posts = await prisma.post.findMany({
    where: { clientId, client: { agencyId } },
    select: { status: true, contentPillar: true, postType: true, createdAt: true },
  });

  // Status counts
  const byStatus: Record<string, number> = {};
  posts.forEach((p) => {
    byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
  });

  // Pillar breakdown
  const byPillarMap: Record<string, number> = {};
  posts.forEach((p) => {
    const key = p.contentPillar ?? "Uncategorized";
    byPillarMap[key] = (byPillarMap[key] ?? 0) + 1;
  });
  const byPillar = Object.entries(byPillarMap).sort((a, b) => b[1] - a[1]);

  // Post type breakdown
  const byTypeMap: Record<string, number> = {};
  posts.forEach((p) => {
    byTypeMap[p.postType] = (byTypeMap[p.postType] ?? 0) + 1;
  });
  const byType = Object.entries(byTypeMap).sort((a, b) => b[1] - a[1]);

  // Last 3 months
  const now = new Date();
  const byMonth = [2, 1, 0].map((i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yr = d.getFullYear();
    const mo = d.getMonth() + 1;
    const label = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
    const mp = posts.filter((p) => {
      const pd = new Date(p.createdAt);
      return pd.getFullYear() === yr && pd.getMonth() + 1 === mo;
    });
    return {
      label,
      total: mp.length,
      posted: mp.filter((p) => p.status === "POSTED").length,
      approved: mp.filter((p) => p.status === "APPROVED").length,
      rejected: mp.filter((p) => p.status === "REJECTED").length,
    };
  });

  const total = posts.length;
  const posted = byStatus["POSTED"] ?? 0;
  const approved = byStatus["APPROVED"] ?? 0;
  const rejected = byStatus["REJECTED"] ?? 0;
  const approvalRate =
    approved + posted + rejected > 0
      ? Math.round(((approved + posted) / (approved + posted + rejected)) * 100)
      : 0;

  return {
    client,
    total,
    posted,
    approved,
    rejected,
    draft: byStatus["DRAFT"] ?? 0,
    approvalRate,
    byPillar,
    byType,
    byMonth,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="font-display font-bold text-2xl tracking-tight">{value}</p>
      <p className="text-xs text-muted-fg mt-1">{label}</p>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

function BarRow({
  label,
  count,
  max,
  color,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <p className="text-sm text-muted w-32 truncate capitalize flex-shrink-0">
        {label.replace(/_/g, " ").toLowerCase()}
      </p>
      <div className="flex-1 bg-surface-warm rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-sm font-semibold w-6 text-right flex-shrink-0">{count}</p>
    </div>
  );
}

function MonthBar({
  label,
  total,
  posted,
  approved,
  maxTotal,
}: {
  label: string;
  total: number;
  posted: number;
  approved: number;
  maxTotal: number;
}) {
  const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
  const postedPct = total > 0 ? Math.round((posted / total) * 100) : 0;
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <p className="text-xs font-semibold text-foreground">{total}</p>
      <div className="w-full bg-surface-warm rounded-lg overflow-hidden h-24 flex flex-col-reverse">
        <div
          className="bg-brand rounded-b-lg transition-all"
          style={{ height: `${pct}%` }}
        />
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-muted">{label}</p>
        {posted > 0 && (
          <p className="text-[10px] text-success">{posted} posted</p>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const agency = await prisma.agency.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!agency) redirect("/dashboard");

  const [clients, resolvedParams] = await Promise.all([
    getClients(agency.id),
    searchParams,
  ]);

  if (clients.length === 0) {
    return (
      <div className="animate-in">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl tracking-tight mb-1">Analytics</h1>
          <p className="text-sm text-muted">Per-client content performance.</p>
        </div>
        <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-12 text-center">
          <BarChart2 className="w-10 h-10 text-muted mx-auto mb-4" />
          <p className="text-sm text-muted">No clients yet. Add a client to see analytics.</p>
          <Link
            href="/clients/new"
            className="mt-4 inline-flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-brand-deep transition-colors"
          >
            Add Client
          </Link>
        </div>
      </div>
    );
  }

  const selectedClientId = resolvedParams.client ?? clients[0].id;
  const data = await getAnalytics(agency.id, selectedClientId);

  const maxMonth = Math.max(...(data?.byMonth.map((m) => m.total) ?? [1]), 1);
  const maxPillar = data?.byPillar[0]?.[1] ?? 1;
  const maxType = data?.byType[0]?.[1] ?? 1;

  const PILLAR_COLORS = [
    "bg-brand",
    "bg-info",
    "bg-success",
    "bg-warning",
    "bg-purple-500",
    "bg-pink-500",
  ];
  const TYPE_LABELS: Record<string, string> = {
    SINGLE_IMAGE: "Single Image",
    CAROUSEL: "Carousel",
    STORY: "Story",
    TEXT_ONLY: "Text Only",
  };

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight mb-1">Analytics</h1>
          <p className="text-sm text-muted">Per-client content performance breakdown.</p>
        </div>
      </div>

      {/* Client Selector */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        {clients.map((c) => (
          <Link
            key={c.id}
            href={`/analytics?client=${c.id}`}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              c.id === selectedClientId
                ? "bg-brand text-white border-brand"
                : "bg-surface border-border-strong text-muted hover:bg-surface-warm hover:text-foreground"
            }`}
          >
            {c.businessName}
          </Link>
        ))}
      </div>

      {!data ? (
        <p className="text-muted text-sm">Client not found.</p>
      ) : (
        <>
          {/* Client context */}
          <div className="mb-6">
            <p className="text-xs text-muted uppercase tracking-wider font-semibold">
              {data.client.niche}
            </p>
            <h2 className="font-display font-bold text-xl mt-0.5">
              {data.client.businessName}
            </h2>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Posts"
              value={data.total}
              icon={FileText}
              color="text-info"
            />
            <StatCard
              label="Published"
              value={data.posted}
              icon={Send}
              color="text-brand"
              sub={data.total > 0 ? `${Math.round((data.posted / data.total) * 100)}% of total` : undefined}
            />
            <StatCard
              label="Approved"
              value={data.approved}
              icon={CheckCircle2}
              color="text-success"
            />
            <StatCard
              label="Approval Rate"
              value={`${data.approvalRate}%`}
              icon={TrendingUp}
              color="text-purple-500"
              sub={`${data.rejected} rejected`}
            />
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly breakdown */}
            <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-6">
              <h3 className="font-display font-semibold text-sm mb-5">Posts by Month</h3>
              {data.byMonth.every((m) => m.total === 0) ? (
                <p className="text-sm text-muted text-center py-8">No posts yet.</p>
              ) : (
                <div className="flex items-end gap-3 h-36">
                  {data.byMonth.map((m) => (
                    <MonthBar
                      key={m.label}
                      label={m.label}
                      total={m.total}
                      posted={m.posted}
                      approved={m.approved}
                      maxTotal={maxMonth}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Content pillar breakdown */}
            <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-6">
              <h3 className="font-display font-semibold text-sm mb-5">By Content Pillar</h3>
              {data.byPillar.length === 0 ? (
                <p className="text-sm text-muted text-center py-8">No posts yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.byPillar.map(([pillar, count], i) => (
                    <BarRow
                      key={pillar}
                      label={pillar}
                      count={count}
                      max={maxPillar}
                      color={PILLAR_COLORS[i % PILLAR_COLORS.length]}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Post type + status row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Post type */}
            <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-6">
              <h3 className="font-display font-semibold text-sm mb-5">By Post Type</h3>
              {data.byType.length === 0 ? (
                <p className="text-sm text-muted text-center py-8">No posts yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.byType.map(([type, count]) => (
                    <BarRow
                      key={type}
                      label={TYPE_LABELS[type] ?? type}
                      count={count}
                      max={maxType}
                      color="bg-info"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Status breakdown */}
            <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-6">
              <h3 className="font-display font-semibold text-sm mb-5">Status Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: "Published", count: data.posted, color: "bg-brand" },
                  { label: "Approved", count: data.approved, color: "bg-success" },
                  { label: "Draft", count: data.draft, color: "bg-warning" },
                  { label: "Rejected", count: data.rejected, color: "bg-red-400" },
                ].map(({ label, count, color }) => (
                  <BarRow
                    key={label}
                    label={label}
                    count={count}
                    max={data.total || 1}
                    color={color}
                  />
                ))}
              </div>
              {data.total === 0 && (
                <p className="text-sm text-muted text-center py-4">No posts yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
