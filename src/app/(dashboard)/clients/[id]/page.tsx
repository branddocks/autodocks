import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  Share2,
  Sparkles,
} from "lucide-react";
import { ClientEditForm } from "./ClientEditForm";

async function getClient(clientId: string, userId: string) {
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      agency: { userId },
      isActive: true,
    },
    include: {
      _count: {
        select: { posts: true, calendars: true },
      },
      posts: {
        where: {
          status: { in: ["DRAFT", "APPROVED", "SCHEDULED", "POSTED"] },
        },
        select: { status: true },
      },
    },
  });
  return client;
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const client = await getClient(id, session.user.id);
  if (!client) notFound();

  const colors = (client.brandColors as string[]) ?? ["#D4764E", "#1A1A1A", "#FFFFFF"];
  const pillars = (client.contentPillars as string[]) ?? [];
  const competitors = (client.competitors as string[]) ?? [];

  const statsMap = client.posts.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  const stats = [
    { label: "Total Posts", value: client._count.posts, icon: FileText, color: "text-info" },
    { label: "Calendars", value: client._count.calendars, icon: Calendar, color: "text-brand" },
    { label: "Published", value: statsMap["POSTED"] || 0, icon: CheckCircle2, color: "text-success" },
    { label: "Pending Review", value: statsMap["DRAFT"] || 0, icon: Clock, color: "text-warning" },
  ];

  const initials = client.businessName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="animate-in max-w-3xl">
      {/* Back */}
      <Link
        href="/clients"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Clients
      </Link>

      {/* Client hero */}
      <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-white text-lg flex-shrink-0"
            style={{ backgroundColor: colors[0] }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-display font-bold text-xl tracking-tight">
                {client.businessName}
              </h1>
              {client.igUsername && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success-bg px-2 py-0.5 rounded-full">
                  <Share2 className="w-3 h-3" />
                  @{client.igUsername}
                </span>
              )}
            </div>
            <p className="text-sm text-muted mb-3">
              {client.niche} · {client.toneOfVoice} · {client.contentLanguage}
            </p>
            <div className="flex items-center gap-1.5">
              {colors.map((c, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-md border border-border-strong"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Link
              href={`/calendar?client=${client.id}`}
              className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-brand-deep transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Generate Calendar
            </Link>
            <Link
              href={`/queue?client=${client.id}`}
              className="inline-flex items-center gap-2 bg-surface-warm border border-border-strong px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-surface transition-colors text-center justify-center"
            >
              Review Queue
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-5 border-t border-[var(--color-border)]">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
              <p className="font-display font-bold text-lg">{s.value}</p>
              <p className="text-xs text-muted-fg">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content pillars summary */}
      {pillars.length > 0 && (
        <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-5 mb-6">
          <h3 className="text-xs font-semibold text-muted mb-3 uppercase tracking-wider">
            Content Pillars
          </h3>
          <div className="flex flex-wrap gap-2">
            {pillars.map((p, i) => (
              <span
                key={i}
                className="bg-brand-50 border border-brand-100 text-brand text-sm px-3 py-1.5 rounded-lg font-medium"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Target audience */}
      <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-5 mb-6">
        <h3 className="text-xs font-semibold text-muted mb-2 uppercase tracking-wider">
          Target Audience
        </h3>
        <p className="text-sm text-foreground">{client.targetAudience}</p>
      </div>

      {/* Extra context */}
      {client.extraContext && (
        <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-5 mb-6">
          <h3 className="text-xs font-semibold text-muted mb-2 uppercase tracking-wider">
            AI Instructions
          </h3>
          <p className="text-sm text-foreground whitespace-pre-wrap">{client.extraContext}</p>
        </div>
      )}

      {/* Edit form — client component */}
      <ClientEditForm
        client={{
          id: client.id,
          businessName: client.businessName,
          niche: client.niche,
          brandColors: colors,
          toneOfVoice: client.toneOfVoice,
          targetAudience: client.targetAudience,
          contentLanguage: client.contentLanguage,
          contentPillars: pillars,
          competitors: competitors,
          extraContext: client.extraContext ?? "",
        }}
      />
    </div>
  );
}
