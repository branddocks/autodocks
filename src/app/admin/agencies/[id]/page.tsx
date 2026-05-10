import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminSubscriptionForm } from "./AdminSubscriptionForm";

export default async function AdminAgencyDetailPage({ params }: { params: { id: string } }) {
  const agency = await prisma.agency.findUnique({
    where: { id: params.id },
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

  const totalPosts = await prisma.post.count({
    where: { client: { agencyId: agency.id } },
  });
  const approvedPosts = await prisma.post.count({
    where: { client: { agencyId: agency.id }, status: "APPROVED" },
  });
  const postedPosts = await prisma.post.count({
    where: { client: { agencyId: agency.id }, status: "POSTED" },
  });

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/agencies" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              ← All Agencies
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-white">{agency.name}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{agency.user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={agency.subStatus} />
          <PlanBadge plan={agency.plan} />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Clients", value: agency._count.clients },
          { label: "Total Posts", value: totalPosts },
          { label: "Approved", value: approvedPosts },
          { label: "Published", value: postedPosts },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Account Info</h2>
          <InfoRow label="Agency ID" value={agency.id} mono />
          <InfoRow label="User Email" value={agency.user.email ?? "—"} />
          <InfoRow label="User Name" value={agency.user.name ?? "—"} />
          <InfoRow label="Joined" value={new Date(agency.createdAt).toLocaleString("en-IN")} />
          <InfoRow label="Razorpay Sub" value={agency.razorpaySubId ?? "Not set"} mono />
          <InfoRow label="Razorpay Customer" value={agency.razorpayCustomerId ?? "Not set"} mono />
          {agency.adminNote && (
            <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-800/40 rounded-lg">
              <p className="text-xs text-yellow-400 font-semibold mb-1">Admin Note</p>
              <p className="text-sm text-yellow-200">{agency.adminNote}</p>
            </div>
          )}
        </div>

        {/* Subscription override form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
            Subscription Management
          </h2>
          <AdminSubscriptionForm
            agencyId={agency.id}
            currentPlan={agency.plan}
            currentStatus={agency.subStatus}
            trialEndsAt={agency.trialEndsAt?.toISOString() ?? null}
            adminNote={agency.adminNote ?? ""}
          />
        </div>
      </div>

      {/* Clients table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Clients ({agency.clients.length})
          </h2>
        </div>
        {agency.clients.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">No clients added yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs text-gray-500 px-4 py-3">Business</th>
                <th className="text-left text-xs text-gray-500 px-4 py-3">Niche</th>
                <th className="text-left text-xs text-gray-500 px-4 py-3">Instagram</th>
                <th className="text-left text-xs text-gray-500 px-4 py-3">Posts</th>
                <th className="text-left text-xs text-gray-500 px-4 py-3">Calendars</th>
                <th className="text-left text-xs text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs text-gray-500 px-4 py-3">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {agency.clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{client.businessName}</td>
                  <td className="px-4 py-3 text-gray-400">{client.niche}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {client.igUsername ? `@${client.igUsername}` : <span className="text-gray-600">Not connected</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-center">{client._count.posts}</td>
                  <td className="px-4 py-3 text-gray-300 text-center">{client._count.calendars}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${client.isActive ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-400"}`}>
                      {client.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(client.createdAt).toLocaleDateString("en-IN")}
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
    <div className="flex justify-between items-start gap-4">
      <span className="text-xs text-gray-500 flex-shrink-0">{label}</span>
      <span className={`text-xs text-right ${mono ? "font-mono text-gray-300" : "text-gray-200"} break-all`}>
        {value}
      </span>
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    STARTER: "bg-blue-900/50 text-blue-300 border-blue-800",
    PRO: "bg-purple-900/50 text-purple-300 border-purple-800",
    ENTERPRISE: "bg-yellow-900/50 text-yellow-300 border-yellow-800",
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded border font-semibold ${styles[plan] ?? "bg-gray-800 text-gray-300 border-gray-700"}`}>
      {plan}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-900/50 text-green-300",
    TRIAL: "bg-yellow-900/50 text-yellow-300",
    PAST_DUE: "bg-orange-900/50 text-orange-300",
    CANCELLED: "bg-red-900/50 text-red-300",
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${styles[status] ?? "bg-gray-800 text-gray-300"}`}>
      {status}
    </span>
  );
}
