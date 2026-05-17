"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, Clock, Zap, AlertTriangle } from "lucide-react";

interface Props {
  agencyId: string;
  currentPlan: string;
  currentStatus: string;
  trialEndsAt: string | null;
  adminNote: string;
  razorpaySubId: string | null;
  razorpayCustomerId: string | null;
}

const PLANS = [
  { id: "STARTER", label: "Starter", price: "₹499/mo", color: "blue" },
  { id: "PRO", label: "Pro", price: "₹999/mo", color: "purple" },
  { id: "ENTERPRISE", label: "Enterprise", price: "Custom", color: "amber" },
];

const STATUSES = [
  { id: "TRIAL", label: "Trial", icon: Clock, color: "yellow" },
  { id: "ACTIVE", label: "Active", icon: CheckCircle2, color: "green" },
  { id: "PAST_DUE", label: "Past Due", icon: AlertTriangle, color: "orange" },
  { id: "CANCELLED", label: "Cancelled", icon: XCircle, color: "red" },
];

const planSelected: Record<string, string> = {
  blue: "bg-blue-600 border-blue-600 text-white",
  purple: "bg-purple-600 border-purple-600 text-white",
  amber: "bg-amber-500 border-amber-500 text-white",
};
const statusSelected: Record<string, string> = {
  yellow: "bg-amber-500 border-amber-500 text-white",
  green: "bg-green-600 border-green-600 text-white",
  orange: "bg-orange-600 border-orange-600 text-white",
  red: "bg-red-600 border-red-600 text-white",
};

export function ControlSubscriptionForm({
  agencyId,
  currentPlan,
  currentStatus,
  trialEndsAt,
  adminNote,
  razorpaySubId,
  razorpayCustomerId,
}: Props) {
  const [plan, setPlan] = useState(currentPlan);
  const [status, setStatus] = useState(currentStatus);
  const [trialDate, setTrialDate] = useState(
    trialEndsAt ? new Date(trialEndsAt).toISOString().split("T")[0] : ""
  );
  const [note, setNote] = useState(adminNote);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const save = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/agencies/${agencyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          subStatus: status,
          trialEndsAt: trialDate || null,
          adminNote: note,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Save failed");
        return;
      }
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 4000);
    } finally {
      setSaving(false);
    }
  };

  const extendTrial = (days: number) => {
    const base = trialDate ? new Date(trialDate) : new Date();
    base.setDate(base.getDate() + days);
    setTrialDate(base.toISOString().split("T")[0]);
    setStatus("TRIAL");
  };

  const activateNow = () => {
    setStatus("ACTIVE");
    setTrialDate("");
  };

  return (
    <div className="space-y-7">
      {/* ── Plan ──────────────────────────────────────────── */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-3">
          Plan
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PLANS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlan(p.id)}
              className={`py-3 px-2 rounded-xl border-2 text-center transition-all font-semibold text-sm ${
                plan === p.id
                  ? planSelected[p.color]
                  : "border-current opacity-30 hover:opacity-60"
              }`}
            >
              <div>{p.label}</div>
              <div className="text-[11px] font-normal opacity-80 mt-0.5">{p.price}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Status ────────────────────────────────────────── */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-3">
          Subscription Status
        </label>
        <div className="grid grid-cols-2 gap-2">
          {STATUSES.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setStatus(s.id)}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  status === s.id
                    ? statusSelected[s.color]
                    : "border-current opacity-30 hover:opacity-60"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={activateNow}
            className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-green-600/10 border border-green-600/30 text-green-600 hover:bg-green-600/20 rounded-xl transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            Activate Now
          </button>
          <button
            onClick={() => setStatus("CANCELLED")}
            className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-red-600/10 border border-red-600/30 text-red-600 hover:bg-red-600/20 rounded-xl transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            Cancel
          </button>
        </div>
      </div>

      {/* ── Trial end date ────────────────────────────────── */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-3">
          Trial End Date
        </label>
        <input
          type="date"
          value={trialDate}
          onChange={(e) => setTrialDate(e.target.value)}
          className="w-full border-2 border-current opacity-40 focus:opacity-100 rounded-xl px-4 py-3 text-sm font-medium bg-transparent focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all"
          style={{ colorScheme: "light dark" }}
        />
        <div className="grid grid-cols-4 gap-2 mt-2">
          {[3, 7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => extendTrial(d)}
              className="py-2 text-xs font-bold rounded-xl border border-current opacity-30 hover:opacity-70 hover:border-amber-500 hover:text-amber-600 transition-all"
            >
              +{d}d
            </button>
          ))}
        </div>
      </div>

      {/* ── Razorpay IDs ──────────────────────────────────── */}
      {(razorpaySubId || razorpayCustomerId) && (
        <div className="border border-current opacity-20 rounded-xl p-4 space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">
            Razorpay
          </p>
          {razorpaySubId && (
            <div className="flex justify-between gap-4 text-sm">
              <span className="opacity-50">Sub ID</span>
              <span className="font-mono text-xs opacity-80 break-all text-right">
                {razorpaySubId}
              </span>
            </div>
          )}
          {razorpayCustomerId && (
            <div className="flex justify-between gap-4 text-sm">
              <span className="opacity-50">Customer ID</span>
              <span className="font-mono text-xs opacity-80 break-all text-right">
                {razorpayCustomerId}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Admin note ────────────────────────────────────── */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-3">
          Internal Note
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Payment ref, WhatsApp proof, custom deal, reason for override…"
          className="w-full border-2 border-current opacity-40 focus:opacity-100 rounded-xl px-4 py-3 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none transition-all placeholder:opacity-30"
        />
      </div>

      {/* ── Error ─────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2.5 bg-red-600/10 border border-red-600/30 text-red-600 text-sm font-medium rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Save button ───────────────────────────────────── */}
      <button
        onClick={save}
        disabled={saving}
        className={`w-full py-4 rounded-2xl text-base font-bold transition-all flex items-center justify-center gap-2.5 ${
          saved
            ? "bg-green-600 text-white"
            : "bg-brand hover:bg-brand-deep text-white disabled:opacity-40"
        }`}
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving…
          </>
        ) : saved ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Changes Saved
          </>
        ) : (
          "Save Changes"
        )}
      </button>

      <p className="text-center text-xs opacity-40 font-medium">
        Changes apply instantly · No notification sent to user
      </p>
    </div>
  );
}
