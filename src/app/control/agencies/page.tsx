import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Customers</h1>
        <p className="text-base opacity-50 mt-1">{agencies.length} total accounts</p>
      </div>

      {/* Table card */}
      <div className="bg-current/[0.04] border border-current/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-current/[0.08]">
              {[
                "Agency / Owner",
                "Plan",
                "Status",
                "Trial / Expiry",
                "Clients",
                "Joined",
                "Note",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-bold uppercase tracking-widest opacity-40 px-5 py-4"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-current/[0.04]">
            {agencies.map((agency) => {
              const trialExpired =
                agency.trialEndsAt && new Date(agency.trialEndsAt) < now;
              const daysLeft = agency.trialEndsAt
                ? Math.ceil(
                    (new Date(agency.trialEndsAt).getTime() - now.getTime()) /
                      86400000
                  )
                : null;

              return (
                <tr
                  key={agency.id}
                  className="hover:bg-current/[0.02] transition-colors"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold">{agency.name}</p>
                    <p className="text-xs opacity-50 mt-0.5">{agency.user.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <PlanBadge plan={agency.plan} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={agency.subStatus} />
                  </td>
                  <td className="px-5 py-4 text-sm">
                    {agency.trialEndsAt ? (
                      trialExpired ? (
                        <span className="text-red-500 font-semibold text-xs">
                          Expired{" "}
                          {new Date(agency.trialEndsAt).toLocaleDateString("en-IN")}
                        </span>
                      ) : (
                        <span
                          className={`text-xs font-medium ${
                            daysLeft !== null && daysLeft <= 3
                              ? "text-amber-500 font-bold"
                              : "opacity-50"
                          }`}
                        >
                          {daysLeft}d left ·{" "}
                          {new Date(agency.trialEndsAt).toLocaleDateString("en-IN")}
                        </span>
                      )
                    ) : (
                      <span className="opacity-25">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center font-semibold">
                    {agency._count.clients}
                  </td>
                  <td className="px-5 py-4 text-xs opacity-40">
                    {new Date(agency.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-5 py-4 max-w-[140px]">
                    {agency.adminNote ? (
                      <p
                        className="text-xs text-amber-600 truncate"
                        title={agency.adminNote}
                      >
                        {agency.adminNote}
                      </p>
                    ) : (
                      <span className="opacity-20 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/control/agencies/${agency.id}`}
                      className="inline-flex items-center gap-1 text-sm text-brand hover:text-brand-deep font-semibold transition-colors whitespace-nowrap"
                    >
                      Manage
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {agencies.length === 0 && (
          <div className="text-center py-16 opacity-30 text-sm">
            No customers yet.
          </div>
        )}
      </div>
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
      className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${
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
      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
        s[status] ?? "bg-gray-500/10 text-gray-500"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
