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
} from "lucide-react";
import Link from "next/link";

const STATS = [
  { label: "Total Clients", value: "0", icon: Users, color: "text-brand" },
  { label: "Posts This Month", value: "0", icon: FileText, color: "text-info" },
  { label: "Published", value: "0", icon: CheckCircle2, color: "text-success" },
  { label: "Pending Review", value: "0", icon: Clock, color: "text-warning" },
];

export default function DashboardPage() {
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

      {/* Empty State */}
      <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-12 text-center">
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
          <h3 className="font-display font-bold text-sm mb-1">Generate Calendar</h3>
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
