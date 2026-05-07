"use client";

import { useState } from "react";
import { Save, Loader2, CheckCircle2, Building2, CreditCard, Calendar, User } from "lucide-react";

interface AgencyData {
  id: string;
  name: string;
  plan: string;
  subStatus: string;
  trialEndsAt: string | null;
  createdAt: string;
  user: {
    email: string | null;
    name: string | null;
    image: string | null;
  };
}

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  STARTER: { label: "Starter", color: "bg-surface-warm border-border-strong text-muted" },
  PRO: { label: "Pro", color: "bg-brand-50 border-brand-100 text-brand" },
  AGENCY: { label: "Agency", color: "bg-purple-50 border-purple-200 text-purple-700" },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  TRIAL: { label: "Trial", color: "bg-warning/10 border-warning/30 text-warning" },
  ACTIVE: { label: "Active", color: "bg-success-bg border-success/20 text-success" },
  CANCELLED: { label: "Cancelled", color: "bg-red-50 border-red-200 text-red-600" },
  EXPIRED: { label: "Expired", color: "bg-red-50 border-red-200 text-red-600" },
};

function trialDaysLeft(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null;
  const diff = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function SettingsClient({ agency }: { agency: AgencyData }) {
  const [name, setName] = useState(agency.name);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const planInfo = PLAN_LABELS[agency.plan] ?? PLAN_LABELS.STARTER;
  const statusInfo = STATUS_LABELS[agency.subStatus] ?? STATUS_LABELS.TRIAL;
  const daysLeft = trialDaysLeft(agency.trialEndsAt);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Agency name cannot be empty."); return; }
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/agency/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save. Please try again.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">

      {/* Agency Profile */}
      <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-4 h-4 text-brand" />
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-muted">
            Agency Profile
          </h2>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">
              Agency Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setSaved(false); }}
              maxLength={80}
              className="w-full bg-surface-warm border border-border-strong rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              placeholder="Your agency name"
            />
            <p className="text-xs text-muted mt-1">{name.length}/80 characters</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading || name === agency.name}
              className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-success font-medium">
                <CheckCircle2 className="w-4 h-4" /> Saved
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Plan & Billing */}
      <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <CreditCard className="w-4 h-4 text-brand" />
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-muted">
            Plan & Billing
          </h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2.5 border-b border-[var(--color-border)]">
            <span className="text-sm text-muted">Current plan</span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${planInfo.color}`}
            >
              {planInfo.label}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-b border-[var(--color-border)]">
            <span className="text-sm text-muted">Status</span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          </div>
          {agency.subStatus === "TRIAL" && daysLeft !== null && (
            <div className="flex items-center justify-between py-2.5 border-b border-[var(--color-border)]">
              <span className="text-sm text-muted">Trial ends</span>
              <span className={`text-sm font-semibold ${daysLeft <= 3 ? "text-red-600" : "text-foreground"}`}>
                {daysLeft === 0
                  ? "Today"
                  : daysLeft === 1
                  ? "Tomorrow"
                  : `${daysLeft} days left`}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-muted">Member since</span>
            <span className="text-sm font-medium">
              {new Date(agency.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        <p className="text-xs text-muted mt-4">
          To upgrade or manage billing, contact{" "}
          <a href="mailto:support@autodocks.app" className="text-brand hover:underline">
            support@autodocks.app
          </a>
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-brand" />
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-muted">
            Account
          </h2>
        </div>
        <div className="space-y-3">
          {agency.user.name && (
            <div className="flex items-center justify-between py-2.5 border-b border-[var(--color-border)]">
              <span className="text-sm text-muted">Name</span>
              <span className="text-sm font-medium">{agency.user.name}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-muted">Email</span>
            <span className="text-sm font-medium">{agency.user.email ?? "—"}</span>
          </div>
        </div>
        <p className="text-xs text-muted mt-4">
          Account email is managed through Google Sign-In and cannot be changed here.
        </p>
      </div>

      {/* Danger zone placeholder */}
      <div className="bg-surface border border-red-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-red-500" />
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-red-500">
            Danger Zone
          </h2>
        </div>
        <p className="text-sm text-muted mb-4">
          Deleting your account will permanently remove all clients, posts, and calendar data. This action cannot be undone.
        </p>
        <button
          disabled
          className="text-sm font-semibold text-red-600 border border-red-200 px-4 py-2 rounded-xl opacity-40 cursor-not-allowed"
        >
          Delete Account
        </button>
        <p className="text-xs text-muted mt-2">Contact support to delete your account.</p>
      </div>
    </div>
  );
}
