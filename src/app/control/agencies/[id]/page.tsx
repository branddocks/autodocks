import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ControlSubscriptionForm } from "./ControlSubscriptionForm";
import {
  ArrowLeft,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  Instagram,
} from "lucide-react";

export default async function ControlAgencyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const agency = await prisma.agency.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, name: true, createdAt: true } },
      clients: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { posts: true, calendars: true } },
        },
      },
      _count: { select: { clients: true } },
    },
  });

  if (!agency) notFound();

  const [totalPosts, approvedPosts, postedPosts, draftPosts] =
    await Promise.all([
      prisma.post.count({ where: { client: { agencyId: agency.id } } }),
      prisma.post.count({
        where: { client: { agencyId: agency.id }, status: "APPROVED" },
      }),
      prisma.post.count({
        where: { client: { agencyId: agency.id }, status: "POSTED" },
      }),
      prisma.post.count({
        where: { client: { agencyId: agency.id }, status: "DRAFT" },
      }),
    ]);

  const now = new Date();
  const trialDaysLeft = agency.trialEndsAt
    ? Math.ceil(
        (new Date(agency.trialEndsAt).getTime() - now.getTime()) / 86400000
      )
    : null;

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm opacity-50">
        <Link
          href="/control"
          className="hover:opacity-100 transition-opacity flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Overview
        </Link>
        <span>/</span>
        <Link href="/control/agencies" className="hover:opacity-100 transition-opacity">
          Customers
        </Link>
        <span>/</span>
        <span className="opacity-100 font-medium">{agency.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{agency.name}</h1>
          <p className="text-base opacity-50 mt-1">{agency.user.email}</p>
          {agency.adminNote && (
            <div className="mt-3 inline-flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-sm rounded-xl px-4 py-2 max-w-lg">
              📝 {agency.adminNote}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={agency.subStatus} />
          <PlanBadge plan={agency.plan} />
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Clients", value: agency._count.clients, icon: Users, color: "text-blue-500" },
          { label: "Total Posts", value: totalPosts, icon: FileText, color: "text-brand" },
          { label: "Draft", value: draftPosts, icon: Clock, color: "opacity-50" },
          { label: "Approved", value: approvedPosts, icon: CheckCircle2, color: "text-green-500" },
          { label: "Published", value: postedPosts, icon: CheckCircle2, color: "text-purple-500" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-current/[0.04] border border-current/10 rounded-2xl p-4 text-center"
            >
              <Icon className={`w-4 h-4 mx-auto mb-2 ${s.color}`} />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs opacity-50 mt-1 font-medium">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account info */}
        <div className="bg-current/[0.04] border border-current/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest opacity-50">
            Account Details
          </h2>
          <div className="space-y-2">
            <InfoRow label="Agency ID" value={agency.id} mono />
            <InfoRow label="User ID" value={agency.user.id} mono />
            <InfoRow label="Email" value={agency.user.email ?? "—"} />
            <InfoRow label="Name" value={agency.user.name ?? "—"} />
            <InfoRow
              label="Joined"
              value={new Date(agency.createdAt).toLocaleString("en-IN")}
            />
            <InfoRow label="Plan" value={agency.plan} />
            <InfoRow label="Status" value={agency.subStatus} />
            {agency.trialEndsAt && (
              <InfoRow
                label="Trial Ends"
                value={`${new Date(agency.trialEndsAt).toLocaleDateString("en-IN")} (${
                  trialDaysLeft !== null && trialDaysLeft < 0
                    ? `expired ${Math.abs(trialDaysLeft)}d ago`
                    : `${trialDaysLeft}d left`
                })`}
              />
            )}
            {agency.razorpaySubId && (
              <InfoRow label="Razorpay Sub" value={agency.razorpaySubId} mono />
            )}
            {agency.razorpayCustomerId && (
              <InfoRow
                label="Razorpay Customer"
                value={agency.razorpayCustomerId}
                mono
              />
            )}
          </div>
        </div>

        {/* Subscription management */}
        <div className="bg-current/[0.04] border border-current/10 rounded-2xl p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-6">
            Subscription Override
          </h2>
          <ControlSubscriptionForm
            agencyId={agency.id}
            currentPlan={agency.plan}
            currentStatus={agency.subStatus}
            trialEndsAt={agency.trialEndsAt?.toISOString() ?? null}
            adminNote={agency.adminNote ?? ""}
            razorpaySubId={agency.razorpaySubId ?? null}
            razorpayCustomerId={agency.razorpayCustomerId ?? null}
          />
        </div>
      </div>

      {/* Clients table */}
      <div className="bg-current/[0.04] border border-current/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-current/10">
          <h2 className="text-xs font-bold uppercase tracking-widest opacity-50">
            Client Accounts ({agency.clients.length})
          </h2>
        </div>
        {agency.clients.length === 0 ? (
          <div className="py-12 text-center text-sm opacity-40">
            No clients added yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-current/[0.06]">
                {[
                  "Business",
                  "Niche",
                  "Instagram",
                  "Posts",
                  "Calendars",
                  "Status",
                  "Added",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-bold uppercase tracking-wider opacity-40 px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-current/[0.04]">
              {agency.clients.map((c) => (
                <tr key={c.id} className="hover:bg-current/[0.02] transition-colors">
                  <td className="px-5 py-3.5 font-semibold">{c.businessName}</td>
                  <td className="px-5 py-3.5 text-sm opacity-50">{c.niche}</td>
                  <td className="px-5 py-3.5 text-sm opacity-50">
                    {c.igUsername ? (
                      <span className="flex items-center gap-1">
                        <Instagram className="w-3 h-3" />@{c.igUsername}
                      </span>
                    ) : (
                      <span className="opacity-30">Not linked</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center font-semibold">
                    {c._count.posts}
                  </td>
                  <td className="px-5 py-3.5 text-center font-semibold">
                    {c._count.calendars}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        c.isActive
                          ? "bg-green-500/10 text-green-600"
                          : "bg-red-500/10 text-red-600"
                      }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs opacity-40">
                    {new Date(c.createdAt).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-current/[0.06] last:border-0">
      <span className="text-sm opacity-40 flex-shrink-0 font-medium">{label}</span>
      <span
        className={`text-sm text-right ${
          mono ? "font-mono opacity-70" : "font-medium"
        } break-all`}
      >
        {value}
      </span>
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const s: Record<string, string> = {
    STARTER: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    PRO: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    ENTERPRISE: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };
  return (
    <span
      className={`text-xs px-3 py-1.5 rounded-xl border font-bold ${
        s[plan] ?? "bg-gray-500/10 text-gray-500 border-gray-500/20"
      }`}
    >
      {plan}
    </span>
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
      className={`text-xs px-3 py-1.5 rounded-full font-bold ${
        s[status] ?? "bg-gray-500/10 text-gray-500"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
