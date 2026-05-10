import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ControlSubscriptionForm } from "./ControlSubscriptionForm";

export default async function ControlAgencyDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const [totalPosts, approvedPosts, postedPosts, draftPosts] = await Promise.all([
    prisma.post.count({ where: { client: { agencyId: agency.id } } }),
    prisma.post.count({ where: { client: { agencyId: agency.id }, status: "APPROVED" } }),
    prisma.post.count({ where: { client: { agencyId: agency.id }, status: "POSTED" } }),
    prisma.post.count({ where: { client: { agencyId: agency.id }, status: "DRAFT" } }),
  ]);

  const now = new Date();
  const trialDaysLeft = agency.trialEndsAt
    ? Math.ceil((new Date(agency.trialEndsAt).getTime() - now.getTime()) / 86400000)
    : null;

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <Link href="/control" className="hover:text-gray-400 transition-colors">Overview</Link>
        <span>/</span>
        <Link href="/control/agencies" className="hover:text-gray-400 transition-colors">Customers</Link>
        <span>/</span>
        <span className="text-gray-400">{agency.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{agency.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{agency.user.email}</p>
          {agency.adminNote && (
            <div className="mt-2 inline-block bg-yellow-900/20 border border-yellow-800/30 text-yellow-400 text-xs rounded-lg px-3 py-1.5 max-w-md">
              📝 {agency.adminNote}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={agency.subStatus} />
          <PlanBadge plan={agency.plan} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Clients", value: agency._count.clients, color: "text-blue-400" },
          { label: "Total Posts", value: totalPosts, color: "text-white" },
          { label: "Draft", value: draftPosts, color: "text-gray-400" },
          { label: "Approved", value: approvedPosts, color: "text-green-400" },
          { label: "Published", value: postedPosts, color: "text-purple-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#111114] border border-white/5 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account info */}
        <div className="bg-[#111114] border border-white/5 rounded-2xl p-6 space-y-4">
          <h2 className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Account Details</h2>
          <div className="space-y-3">
            <InfoRow label="Agency ID" value={agency.id} mono />
            <InfoRow label="User ID" value={agency.user.id} mono />
            <InfoRow label="Email" value={agency.user.email ?? "—"} />
            <InfoRow label="Name" value={agency.user.name ?? "—"} />
            <InfoRow label="Joined" value={new Date(agency.createdAt).toLocaleString("en-IN")} />
            <InfoRow label="Current Plan" value={agency.plan} />
            <InfoRow label="Sub Status" value={agency.subStatus} />
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
            {agency.razorpaySubId && <InfoRow label="Razorpay Sub" value={agency.razorpaySubId} mono />}
            {agency.razorpayCustomerId && <InfoRow label="Razorpay Customer" value={agency.razorpayCustomerId} mono />}
          </div>
        </div>

        {/* Subscription management */}
        <div className="bg-[#111114] border border-white/5 rounded-2xl p-6">
          <h2 className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-5">
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

      {/* Clients */}
      <div className="bg-[#111114] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
            Client Accounts ({agency.clients.length})
          </h2>
        </div>
        {agency.clients.length === 0 ? (
          <div className="py-12 text-center text-gray-600 text-sm">No clients added yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Business", "Niche", "Instagram", "Posts", "Calendars", "Status", "Added"].map((h) => (
                  <th key={h} className="text-left text-[11px] text-gray-600 px-5 py-3 font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {agency.clients.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 font-medium text-white">{c.businessName}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{c.niche}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {c.igUsername ? `@${c.igUsername}` : <span className="text-gray-700">Not linked</span>}
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-center">{c._count.posts}</td>
                  <td className="px-5 py-3 text-gray-400 text-center">{c._count.calendars}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600 text-xs">
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

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4 py-1 border-b border-white/[0.03] last:border-0">
      <span className="text-xs text-gray-600 flex-shrink-0">{label}</span>
      <span className={`text-xs text-right ${mono ? "font-mono text-gray-400" : "text-gray-300"} break-all`}>{value}</span>
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const s: Record<string, string> = { STARTER: "bg-blue-900/30 text-blue-400 border-blue-800/30", PRO: "bg-purple-900/30 text-purple-400 border-purple-800/30", ENTERPRISE: "bg-yellow-900/30 text-yellow-400 border-yellow-800/30" };
  return <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${s[plan] ?? "bg-gray-900 text-gray-400 border-gray-800"}`}>{plan}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = { ACTIVE: "bg-green-900/30 text-green-400", TRIAL: "bg-yellow-900/30 text-yellow-400", PAST_DUE: "bg-orange-900/30 text-orange-400", CANCELLED: "bg-red-900/30 text-red-400" };
  return <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${s[status] ?? "bg-gray-800 text-gray-400"}`}>{status.replace("_", " ")}</span>;
}
