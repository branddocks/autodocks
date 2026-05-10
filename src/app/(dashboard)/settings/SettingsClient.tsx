"use client";

import { useState } from "react";
import {
  Save,
  Loader2,
  CheckCircle2,
  Building2,
  CreditCard,
  User,
  Zap,
  Crown,
  AlertCircle,
  XCircle,
} from "lucide-react";

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
  ENTERPRISE: { label: "Enterprise", color: "bg-purple-50 border-purple-200 text-purple-700" },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  TRIAL: { label: "Free Trial", color: "bg-warning/10 border-warning/30 text-warning" },
  ACTIVE: { label: "Active", color: "bg-success-bg border-success/20 text-success" },
  PAST_DUE: { label: "Payment Failed", color: "bg-orange-50 border-orange-200 text-orange-600" },
  CANCELLED: { label: "Cancelled", color: "bg-red-50 border-red-200 text-red-600" },
};

function trialDaysLeft(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null;
  const diff = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ─── Razorpay checkout loader ─────────────────────────────────────────────────

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function openRazorpayCheckout(opts: {
  subscriptionId: string;
  keyId: string;
  name: string;
  email: string;
  plan: "STARTER" | "PRO";
  onSuccess: () => void;
  onDismiss: () => void;
}) {
  const loaded = await loadRazorpayScript();
  if (!loaded) throw new Error("Failed to load Razorpay checkout script.");

  const rzp = new window.Razorpay({
    key: opts.keyId,
    subscription_id: opts.subscriptionId,
    name: "AutoDocks",
    description: opts.plan === "PRO" ? "Pro Plan — ₹999/month" : "Starter Plan — ₹499/month",
    image: "/icon.png",
    prefill: {
      name: opts.name,
      email: opts.email,
    },
    theme: { color: "#D4764E" },
    modal: {
      ondismiss: opts.onDismiss,
    },
    handler: () => {
      opts.onSuccess();
    },
  });
  rzp.open();
}

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  currentPlan,
  currentStatus,
  onSubscribe,
  subscribing,
}: {
  plan: "STARTER" | "PRO";
  currentPlan: string;
  currentStatus: string;
  onSubscribe: (plan: "STARTER" | "PRO") => void;
  subscribing: boolean;
}) {
  const isPro = plan === "PRO";
  const isCurrentPlan = currentPlan === plan && currentStatus === "ACTIVE";
  const isTrial = currentStatus === "TRIAL";
  const isCancelled = currentStatus === "CANCELLED";
  const isPastDue = currentStatus === "PAST_DUE";

  const canSubscribe = isTrial || isCancelled || isPastDue || (currentStatus === "ACTIVE" && currentPlan !== plan);
  const buttonLabel = isCurrentPlan
    ? "Current plan"
    : canSubscribe
    ? `Subscribe to ${isPro ? "Pro" : "Starter"}`
    : "Upgrade";

  const features = isPro
    ? [
        "10 clients",
        "300 AI posts/month",
        "AI image generation",
        "Instagram auto-posting",
        "Smart calendar",
        "Priority support",
        "Custom AI prompts",
      ]
    : [
        "3 clients",
        "90 AI posts/month",
        "AI image generation",
        "Instagram auto-posting",
        "Basic calendar",
        "Email support",
      ];

  return (
    <div
      className={`relative rounded-2xl border p-5 flex flex-col ${
        isPro
          ? "border-brand bg-brand-50"
          : "border-[var(--color-border)] bg-surface"
      }`}
    >
      {isPro && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="flex items-center gap-1 bg-brand text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            <Crown className="w-3 h-3" />
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-4">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
          {isPro ? "Pro" : "Starter"}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-display font-black">
            ₹{isPro ? "999" : "499"}
          </span>
          <span className="text-sm text-muted">/month</span>
        </div>
        <p className="text-xs text-muted mt-1">
          ₹{isPro ? "9,588" : "4,788"}/year (save 20% annually)
        </p>
      </div>

      <ul className="space-y-2 flex-1 mb-5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <CheckCircle2
              className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                isPro ? "text-brand" : "text-success"
              }`}
            />
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={() => !isCurrentPlan && onSubscribe(plan)}
        disabled={isCurrentPlan || subscribing}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
          isCurrentPlan
            ? "bg-success-bg border border-success/20 text-success cursor-default"
            : isPro
            ? "bg-brand text-white hover:bg-brand-deep disabled:opacity-50"
            : "border border-border-strong hover:bg-surface-warm disabled:opacity-50"
        }`}
      >
        {subscribing && !isCurrentPlan ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isCurrentPlan ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : isPro ? (
          <Crown className="w-4 h-4" />
        ) : (
          <Zap className="w-4 h-4" />
        )}
        {subscribing && !isCurrentPlan ? "Opening checkout…" : buttonLabel}
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SettingsClient({ agency }: { agency: AgencyData }) {
  const [name, setName] = useState(agency.name);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [nameError, setNameError] = useState("");

  const [subscribing, setSubscribing] = useState(false);
  const [subError, setSubError] = useState("");
  const [subSuccess, setSubSuccess] = useState("");

  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const planInfo = PLAN_LABELS[agency.plan] ?? PLAN_LABELS.STARTER;
  const statusInfo = STATUS_LABELS[agency.subStatus] ?? STATUS_LABELS.TRIAL;
  const daysLeft = trialDaysLeft(agency.trialEndsAt);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setNameError("Agency name cannot be empty."); return; }
    setLoading(true);
    setNameError("");
    setSaved(false);
    try {
      const res = await fetch("/api/agency/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNameError(data.error || "Failed to save. Please try again.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: "STARTER" | "PRO") => {
    setSubscribing(true);
    setSubError("");
    setSubSuccess("");
    try {
      const res = await fetch("/api/razorpay/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json() as {
        subscriptionId?: string;
        keyId?: string;
        agencyName?: string;
        email?: string;
        error?: string;
      };

      if (!res.ok || !data.subscriptionId || !data.keyId) {
        setSubError(data.error ?? "Failed to create subscription. Try again.");
        return;
      }

      await openRazorpayCheckout({
        subscriptionId: data.subscriptionId,
        keyId: data.keyId,
        name: data.agencyName ?? agency.name,
        email: data.email ?? agency.user.email ?? "",
        plan,
        onSuccess: () => {
          setSubSuccess(
            `🎉 Payment successful! Your ${plan === "PRO" ? "Pro" : "Starter"} plan is now active. Refresh the page to see your updated plan.`
          );
          setSubscribing(false);
        },
        onDismiss: () => {
          setSubscribing(false);
        },
      });
    } catch (err) {
      setSubError(err instanceof Error ? err.message : "Checkout failed. Try again.");
      setSubscribing(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError("");
    try {
      const res = await fetch("/api/razorpay/cancel", { method: "POST" });
      const data = await res.json() as { success?: boolean; message?: string; error?: string };
      if (!res.ok) {
        setCancelError(data.error ?? "Failed to cancel. Contact support.");
        return;
      }
      setCancelSuccess(data.message ?? "Subscription cancelled.");
      setShowCancelConfirm(false);
    } finally {
      setCancelling(false);
    }
  };

  const isActive = agency.subStatus === "ACTIVE";
  const isPastDue = agency.subStatus === "PAST_DUE";

  return (
    <div className="max-w-2xl space-y-4">

      {/* Payment failed banner */}
      {isPastDue && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-700 mb-1">Payment failed</p>
            <p className="text-sm text-orange-600">
              Your last payment didn&apos;t go through. Update your payment method to restore access.
              Razorpay will retry automatically — or subscribe again below.
            </p>
          </div>
        </div>
      )}

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

          {nameError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {nameError}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading || name === agency.name}
              className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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

        {/* Current status row */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between py-2.5 border-b border-[var(--color-border)]">
            <span className="text-sm text-muted">Current plan</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${planInfo.color}`}>
              {planInfo.label}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-b border-[var(--color-border)]">
            <span className="text-sm text-muted">Status</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusInfo.color}`}>
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
                day: "numeric", month: "long", year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Success / Error banners */}
        {subSuccess && (
          <div className="flex items-start gap-3 bg-success-bg border border-success/20 rounded-xl p-4 mb-4">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
            <p className="text-sm text-success">{subSuccess}</p>
          </div>
        )}
        {subError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{subError}</p>
          </div>
        )}

        {/* Plan cards */}
        {!isActive && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <PlanCard
              plan="STARTER"
              currentPlan={agency.plan}
              currentStatus={agency.subStatus}
              onSubscribe={handleSubscribe}
              subscribing={subscribing}
            />
            <PlanCard
              plan="PRO"
              currentPlan={agency.plan}
              currentStatus={agency.subStatus}
              onSubscribe={handleSubscribe}
              subscribing={subscribing}
            />
          </div>
        )}

        {/* Active plan — show upgrade/cancel */}
        {isActive && (
          <div className="space-y-3">
            {agency.plan !== "PRO" && (
              <div className="flex items-center justify-between bg-brand-50 border border-brand-100 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-brand">Upgrade to Pro</p>
                  <p className="text-xs text-muted">10 clients, 300 posts, priority support</p>
                </div>
                <button
                  onClick={() => handleSubscribe("PRO")}
                  disabled={subscribing}
                  className="flex items-center gap-1.5 bg-brand text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-deep transition-colors disabled:opacity-50"
                >
                  {subscribing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crown className="w-3.5 h-3.5" />}
                  Upgrade — ₹999/mo
                </button>
              </div>
            )}

            {/* Cancel */}
            {!showCancelConfirm ? (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="text-xs text-muted hover:text-red-500 transition-colors"
              >
                Cancel subscription
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-red-700">Cancel subscription?</p>
                <p className="text-xs text-red-600">
                  You&apos;ll keep access until the end of your current billing period.
                  Your data won&apos;t be deleted.
                </p>
                {cancelError && (
                  <p className="text-xs text-red-700 font-medium">{cancelError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={cancelling}
                    className="flex-1 text-sm border border-red-200 text-red-600 rounded-xl py-2 hover:bg-red-100 transition-colors font-medium"
                  >
                    Keep plan
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="flex-1 text-sm bg-red-600 text-white rounded-xl py-2 hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
                  >
                    {cancelling ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Yes, cancel"}
                  </button>
                </div>
              </div>
            )}

            {cancelSuccess && (
              <p className="text-xs text-success bg-success-bg border border-success/20 rounded-xl px-3 py-2">
                {cancelSuccess}
              </p>
            )}
          </div>
        )}

        <p className="text-xs text-muted mt-4">
          Questions?{" "}
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

      {/* Danger Zone */}
      <div className="bg-surface border border-red-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
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
