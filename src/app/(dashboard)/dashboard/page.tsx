import {
  Users,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Plus,
  Calendar,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function getDashboardData(userId: string) {
  const agency = await prisma.agency.findUnique({
    where: { userId },
    select: { id: true, createdAt: true },
  });

  if (!agency) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalClients, postsThisMonth, publishedCount, pendingCount, hasCalendar, hasInstagram] =
    await Promise.all([
      prisma.client.count({ where: { agencyId: agency.id, isActive: true } }),
      prisma.post.count({
        where: { client: { agencyId: agency.id }, createdAt: { gte: startOfMonth } },
      }),
      prisma.post.count({ where: { client: { agencyId: agency.id }, status: "POSTED" } }),
      prisma.post.count({ where: { client: { agencyId: agency.id }, status: "DRAFT" } }),
      prisma.calendar.count({ where: { client: { agencyId: agency.id } } }).then((c) => c > 0),
      prisma.client.count({
        where: { agencyId: agency.id, isActive: true, igUserId: { not: null } },
      }).then((c) => c > 0),
    ]);

  const ageDays = (Date.now() - agency.createdAt.getTime()) / (1000 * 60 * 60 * 24);

  return {
    totalClients,
    postsThisMonth,
    publishedCount,
    pendingCount,
    // Onboarding checklist
    checklist: {
      show: ageDays < 14, // show for first 2 weeks
      addedClient: totalClients > 0,
      generatedCalendar: hasCalendar,
      reviewedPost: publishedCount > 0 || pendingCount > 0,
      connectedInstagram: hasInstagram,
    },
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const data = await getDashboardData(session.user.id);
  const stats = data;

  const hasClients = (stats?.totalClients ?? 0) > 0;
  const checklist = data?.checklist;
  const allChecklistDone = checklist
    ? checklist.addedClient && checklist.generatedCalendar && checklist.reviewedPost
    : true;

  const STATS = [
    {
      label: "Total Clients",
      value: stats?.totalClients ?? 0,
      icon: Users,
      color: "text-brand",
    },
    {
      label: "Posts This Month",
      value: stats?.postsThisMonth ?? 0,
      icon: FileText,
      color: "text-info",
    },
    {
      label: "Published",
      value: stats?.publishedCount ?? 0,
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      label: "Pending Review",
      value: stats?.pendingCount ?? 0,
      icon: Clock,
      color: "text-warning",
    },
  ];

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl tracking-tight mb-1">
          Dashboard
        </h1>
        <p className="text-sm text-muted">
          Overview of all your clients and content.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface border border-[var(--color-border)] rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="font-display font-bold text-2xl tracking-tight">
              {stat.value}
            </p>
            <p className="text-xs text-muted-fg mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Getting Started Checklist — visible for first 2 weeks until all done */}
      {checklist?.show && !allChecklistDone && (
        <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-base mb-1">Getting started</h2>
              <p className="text-xs text-muted">Complete these steps to get the most out of AutoDocks.</p>
            </div>
            <span className="text-xs font-semibold text-brand bg-brand-50 border border-brand-100 rounded-full px-2.5 py-1">
              {[checklist.addedClient, checklist.generatedCalendar, checklist.reviewedPost, checklist.connectedInstagram].filter(Boolean).length} / 4
            </span>
          </div>
          <div className="space-y-2">
            {[
              {
                done: checklist.addedClient,
                label: "Add your first client",
                desc: "Brand colors, tone, content pillars — set it once.",
                href: checklist.addedClient ? undefined : "/clients/new",
                cta: "Add client",
              },
              {
                done: checklist.generatedCalendar,
                label: "Generate a content calendar",
                desc: "AI creates 30 days of branded content in under 2 minutes.",
                href: checklist.generatedCalendar ? undefined : "/calendar",
                cta: "Generate calendar",
              },
              {
                done: checklist.reviewedPost,
                label: "Review & approve a post",
                desc: "Edit captions, regenerate images, then approve for auto-posting.",
                href: checklist.reviewedPost ? undefined : "/queue",
                cta: "Open queue",
              },
              {
                done: checklist.connectedInstagram,
                label: "Connect Instagram",
                desc: "Link a client's Instagram Business account for auto-posting.",
                href: checklist.connectedInstagram ? undefined : "/clients",
                cta: "Connect now",
              },
            ].map((step) => (
              <div
                key={step.label}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 border transition-all ${
                  step.done
                    ? "bg-success-bg border-success/20 opacity-60"
                    : "bg-surface-warm border-border-strong"
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? "bg-success" : "border-2 border-border-strong"}`}>
                  {step.done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${step.done ? "line-through text-muted" : ""}`}>{step.label}</p>
                  {!step.done && <p className="text-xs text-muted-fg">{step.desc}</p>}
                </div>
                {!step.done && step.href && (
                  <Link
                    href={step.href}
                    className="flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-deep transition-colors flex-shrink-0"
                  >
                    {step.cta} <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state — only shown when no clients yet */}
      {!hasClients && (
        <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-12 text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-brand" />
          </div>
          <h2 className="font-display font-bold text-xl mb-2">
            Welcome to AutoDocks
          </h2>
          <p className="text-sm text-muted max-w-md mx-auto mb-8 leading-relaxed">
            Add your first client to start generating AI-powered content
            calendars. Set up their brand profile, and we'll handle the rest.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/clients/new"
              className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-brand-deep transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Client
            </Link>
            <Link
              href="/calendar"
              className="inline-flex items-center gap-2 bg-surface-warm border border-border-strong px-6 py-3 rounded-xl font-semibold text-sm hover:bg-surface transition-colors"
            >
              <Calendar className="w-4 h-4" />
              View Calendar
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <Link
          href="/clients/new"
          className="bg-surface border border-[var(--color-border)] rounded-2xl p-6 hover:border-brand-100 hover:shadow-md transition-all group"
        >
          <Users className="w-5 h-5 text-brand mb-3" />
          <h3 className="font-display font-bold text-sm mb-1">Add Client</h3>
          <p className="text-xs text-muted leading-relaxed">
            Set up a brand profile with colors, tone, and content pillars.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand mt-3 group-hover:gap-2 transition-all">
            Get started <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/calendar"
          className="bg-surface border border-[var(--color-border)] rounded-2xl p-6 hover:border-brand-100 hover:shadow-md transition-all group"
        >
          <Sparkles className="w-5 h-5 text-brand mb-3" />
          <h3 className="font-display font-bold text-sm mb-1">
            Generate Calendar
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            AI creates a full month of content in under 2 minutes.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand mt-3 group-hover:gap-2 transition-all">
            Generate <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/queue"
          className="bg-surface border border-[var(--color-border)] rounded-2xl p-6 hover:border-brand-100 hover:shadow-md transition-all group"
        >
          <AlertCircle className="w-5 h-5 text-brand mb-3" />
          <h3 className="font-display font-bold text-sm mb-1">Review Queue</h3>
          <p className="text-xs text-muted leading-relaxed">
            Approve, edit, or reject AI-generated content before it posts.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand mt-3 group-hover:gap-2 transition-all">
            Review <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
    </div>
  );
}
