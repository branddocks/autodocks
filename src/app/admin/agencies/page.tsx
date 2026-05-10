import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminAgenciesPage() {
  const agencies = await prisma.agency.findMany({
    include: {
      user: { select: { email: true, name: true, createdAt: true } },
      _count: { select: { clients: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">All Agencies</h1>
          <p className="text-gray-400 text-sm mt-1">{agencies.length} total accounts</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Agency</th>
              <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Email</th>
              <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Plan</th>
              <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Trial Ends</th>
              <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Clients</th>
              <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {agencies.map((agency) => (
              <tr key={agency.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{agency.name}</p>
                </td>
                <td className="px-4 py-3 text-gray-300">{agency.user.email}</td>
                <td className="px-4 py-3">
                  <PlanBadge plan={agency.plan} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={agency.subStatus} />
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {agency.trialEndsAt
                    ? new Date(agency.trialEndsAt) < new Date()
                      ? <span className="text-red-400">Expired {new Date(agency.trialEndsAt).toLocaleDateString("en-IN")}</span>
                      : new Date(agency.trialEndsAt).toLocaleDateString("en-IN")
                    : "—"}
                </td>
                <td className="px-4 py-3 text-gray-300 text-center">{agency._count.clients}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(agency.createdAt).toLocaleDateString("en-IN")}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/agencies/${agency.id}`}
                    className="text-xs text-brand hover:text-brand-deep font-medium transition-colors"
                  >
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {agencies.length === 0 && (
          <div className="text-center py-12 text-gray-500">No agencies yet.</div>
        )}
      </div>
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
    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${styles[plan] ?? "bg-gray-800 text-gray-300 border-gray-700"}`}>
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
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] ?? "bg-gray-800 text-gray-300"}`}>
      {status}
    </span>
  );
}
