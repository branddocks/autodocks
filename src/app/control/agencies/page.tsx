import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ControlAgenciesPage() {
  const agencies = await prisma.agency.findMany({
    include: {
      user: { select: { email: true, name: true } },
      _count: { select: { clients: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">All Customers</h1>
          <p className="text-gray-500 text-sm mt-1">{agencies.length} total accounts</p>
        </div>
      </div>

      <div className="bg-[#111114] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {["Agency / Owner", "Plan", "Status", "Trial / Expiry", "Clients", "Joined", "Note", ""].map((h) => (
                <th key={h} className="text-left text-[11px] text-gray-600 uppercase tracking-wider px-5 py-3.5 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {agencies.map((agency) => {
              const trialExpired = agency.trialEndsAt && new Date(agency.trialEndsAt) < now;
              const daysLeft = agency.trialEndsAt
                ? Math.ceil((new Date(agency.trialEndsAt).getTime() - now.getTime()) / 86400000)
                : null;

              return (
                <tr key={agency.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-white">{agency.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{agency.user.email}</p>
                  </td>
                  <td className="px-5 py-3.5"><PlanBadge plan={agency.plan} /></td>
                  <td className="px-5 py-3.5"><StatusBadge status={agency.subStatus} /></td>
                  <td className="px-5 py-3.5 text-xs">
                    {agency.trialEndsAt ? (
                      trialExpired ? (
                        <span className="text-red-400">Expired {new Date(agency.trialEndsAt).toLocaleDateString("en-IN")}</span>
                      ) : (
                        <span className={daysLeft !== null && daysLeft <= 3 ? "text-yellow-400 font-semibold" : "text-gray-400"}>
                          {daysLeft}d left · {new Date(agency.trialEndsAt).toLocaleDateString("en-IN")}
                        </span>
                      )
                    ) : (
                      <span className="text-gray-700">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-300 text-center">{agency._count.clients}</td>
                  <td className="px-5 py-3.5 text-gray-600 text-xs">
                    {new Date(agency.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-5 py-3.5 max-w-[160px]">
                    {agency.adminNote ? (
                      <p className="text-xs text-yellow-500/80 truncate" title={agency.adminNote}>
                        {agency.adminNote}
                      </p>
                    ) : (
                      <span className="text-gray-700 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/control/agencies/${agency.id}`}
                      className="text-xs text-brand hover:text-brand-deep font-semibold transition-colors whitespace-nowrap"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {agencies.length === 0 && (
          <div className="text-center py-16 text-gray-600 text-sm">No customers yet.</div>
        )}
      </div>
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const s: Record<string, string> = { STARTER: "text-blue-400 bg-blue-900/20 border-blue-800/30", PRO: "text-purple-400 bg-purple-900/20 border-purple-800/30", ENTERPRISE: "text-yellow-400 bg-yellow-900/20 border-yellow-800/30" };
  return <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${s[plan] ?? "text-gray-400 bg-gray-900 border-gray-800"}`}>{plan}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = { ACTIVE: "bg-green-900/30 text-green-400", TRIAL: "bg-yellow-900/30 text-yellow-400", PAST_DUE: "bg-orange-900/30 text-orange-400", CANCELLED: "bg-red-900/30 text-red-400" };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s[status] ?? "bg-gray-800 text-gray-400"}`}>{status.replace("_", " ")}</span>;
}
