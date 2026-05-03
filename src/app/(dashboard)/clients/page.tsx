import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Plus,
  Users,
  Sparkles,
  ArrowRight,
  Calendar,
  FileText,
  Share2,
} from "lucide-react";

async function getClients(userId: string) {
  const agency = await prisma.agency.findUnique({
    where: { userId },
    include: {
      clients: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              posts: true,
              calendars: true,
            },
          },
        },
      },
    },
  });
  return { agency };
}

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { agency } = await getClients(session.user.id);
  const clients = agency?.clients ?? [];
  const plan = agency?.plan ?? "STARTER";
  const maxClients = plan === "PRO" ? 10 : 3;
  const atLimit = clients.length >= maxClients;

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight mb-1">
            Clients
          </h1>
          <p className="text-sm text-muted">
            {clients.length} of {maxClients} clients ·{" "}
            {plan === "PRO" ? "Pro Plan" : "Starter Plan"}
          </p>
        </div>
        {atLimit ? (
          <Link
            href="/settings"
            className="flex items-center gap-2 bg-surface-warm border border-border-strong text-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-surface transition-colors"
          >
            Upgrade for more →
          </Link>
        ) : (
          <Link
            href="/clients/new"
            className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-brand-deep transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Client
          </Link>
        )}
      </div>

      {/* Plan usage bar */}
      {clients.length > 0 && (
        <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-4 mb-6 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-muted mb-1.5">
              <span>Client slots used</span>
              <span className="font-semibold">
                {clients.length}/{maxClients}
              </span>
            </div>
            <div className="h-1.5 bg-surface-warm rounded-full overflow-hidden">
              <div
                className="h-full bg-brand rounded-full transition-all"
                style={{ width: `${(clients.length / maxClients) * 100}%` }}
              />
            </div>
          </div>
          {!atLimit && (
            <Link
              href="/clients/new"
              className="text-xs font-semibold text-brand hover:underline whitespace-nowrap"
            >
              + Add client
            </Link>
          )}
          {atLimit && (
            <Link
              href="/settings"
              className="text-xs font-semibold text-brand hover:underline whitespace-nowrap"
            >
              Upgrade plan
            </Link>
          )}
        </div>
      )}

      {/* Empty state */}
      {clients.length === 0 && (
        <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-5">
            <Users className="w-7 h-7 text-brand" />
          </div>
          <h2 className="font-display font-bold text-lg mb-2">
            No clients yet
          </h2>
          <p className="text-sm text-muted max-w-sm mx-auto mb-6">
            Add your first client's brand profile. AI will use it to generate
            perfectly branded content calendars.
          </p>
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-brand-deep transition-colors"
          >
            <Sparkles className="w-4 h-4" /> Add Your First Client
          </Link>
        </div>
      )}

      {/* Client grid */}
      {clients.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => {
            const colors = (client.brandColors as string[]) ?? [
              "#D4764E",
              "#1A1A1A",
              "#FFFFFF",
            ];
            const pillars = (client.contentPillars as string[]) ?? [];
            const initials = client.businessName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="bg-surface border border-[var(--color-border)] rounded-2xl p-6 hover:border-brand-100 hover:shadow-md transition-all group flex flex-col"
              >
                {/* Client avatar + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-white text-sm flex-shrink-0"
                    style={{ backgroundColor: colors[0] }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-sm truncate">
                      {client.businessName}
                    </h3>
                    <p className="text-xs text-muted">{client.niche}</p>
                  </div>
                  {client.igUsername && (
                    <Share2 className="w-4 h-4 text-success flex-shrink-0" />
                  )}
                </div>

                {/* Brand colors */}
                <div className="flex items-center gap-1.5 mb-3">
                  {colors.slice(0, 3).map((c, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-md border border-border-strong"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <span className="text-xs text-muted-fg ml-1">
                    {client.toneOfVoice} · {client.contentLanguage}
                  </span>
                </div>

                {/* Content pillars */}
                {pillars.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {pillars.slice(0, 3).map((p, i) => (
                      <span
                        key={i}
                        className="text-xs bg-surface-warm border border-border-strong px-2 py-0.5 rounded-md text-muted"
                      >
                        {p}
                      </span>
                    ))}
                    {pillars.length > 3 && (
                      <span className="text-xs text-muted-fg px-2 py-0.5">
                        +{pillars.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Stats + CTA */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs text-muted-fg">
                      <Calendar className="w-3 h-3" />
                      <span>{client._count.calendars} calendars</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-fg">
                      <FileText className="w-3 h-3" />
                      <span>{client._count.posts} posts</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted group-hover:text-brand transition-colors" />
                </div>
              </Link>
            );
          })}

          {/* Add client card (if not at limit) */}
          {!atLimit && (
            <Link
              href="/clients/new"
              className="bg-surface border border-dashed border-border-strong rounded-2xl p-6 hover:border-brand-100 hover:bg-brand-50 transition-all flex flex-col items-center justify-center text-center gap-3 min-h-[200px]"
            >
              <div className="w-10 h-10 rounded-xl bg-surface-warm border border-border-strong flex items-center justify-center">
                <Plus className="w-5 h-5 text-muted" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted">Add client</p>
                <p className="text-xs text-muted-fg">
                  {maxClients - clients.length} slot
                  {maxClients - clients.length !== 1 ? "s" : ""} remaining
                </p>
              </div>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
