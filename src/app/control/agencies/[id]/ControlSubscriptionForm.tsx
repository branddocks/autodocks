"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  agencyId: string;
  currentPlan: string;
  currentStatus: string;
  trialEndsAt: string | null;
  adminNote: string;
  razorpaySubId: string | null;
  razorpayCustomerId: string | null;
}

const PLANS = ["STARTER", "PRO", "ENTERPRISE"];
const STATUSES = ["TRIAL", "ACTIVE", "PAST_DUE", "CANCELLED"];

export function ControlSubscriptionForm({
  agencyId, currentPlan, currentStatus, trialEndsAt, adminNote, razorpaySubId, razorpayCustomerId
}: Props) {
  const [plan, setPlan] = useState(currentPlan);
  const [status, setStatus] = useState(currentStatus);
  const [trialDate, setTrialDate] = useState(
    trialEndsAt ? new Date(trialEndsAt).toISOString().split("T")[0] : ""
  );
  const [note, setNote] = useState(adminNote);
  const [rzpSub, setRzpSub] = useState(razorpaySubId ?? "");
  const [rzpCustomer, setRzpCustomer] = useState(razorpayCustomerId ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const save = async () => {
    setSaving(true); setError(""); setSaved(false);
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
        setError(d.error ?? "Save failed"); return;
      }
      setSaved(true);
      router.refresh(); // re-render server component so badges + account details update
      setTimeout(() => setSaved(false), 3000);
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
    <div className="space-y-6">
      {/* Plan */}
      <div>
        <label className="text-[11px] text-gray-500 uppercase tracking-wider block mb-2 font-semibold">Plan</label>
        <div className="flex gap-2">
          {PLANS.map((p) => (
            <button key={p} onClick={() => setPlan(p)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                plan === p
                  ? p === "STARTER" ? "bg-blue-600 border-blue-500 text-white"
                    : p === "PRO" ? "bg-purple-600 border-purple-500 text-white"
                    : "bg-yellow-600 border-yellow-500 text-black"
                  : "border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300"
              }`}
            >{p}</button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="text-[11px] text-gray-500 uppercase tracking-wider block mb-2 font-semibold">Subscription Status</label>
        <div className="grid grid-cols-2 gap-2">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                status === s
                  ? s === "ACTIVE" ? "bg-green-700 border-green-600 text-white"
                    : s === "TRIAL" ? "bg-yellow-700 border-yellow-600 text-white"
                    : s === "PAST_DUE" ? "bg-orange-700 border-orange-600 text-white"
                    : "bg-red-800 border-red-700 text-white"
                  : "border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300"
              }`}
            >{s.replace("_", " ")}</button>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 mt-2">
          <button onClick={activateNow}
            className="flex-1 text-xs py-1.5 bg-green-900/30 border border-green-800/40 text-green-400 hover:bg-green-900/50 rounded-lg transition-colors font-semibold">
            ✓ Activate Now
          </button>
          <button onClick={() => setStatus("CANCELLED")}
            className="flex-1 text-xs py-1.5 bg-red-900/20 border border-red-800/30 text-red-400 hover:bg-red-900/40 rounded-lg transition-colors font-semibold">
            ✕ Cancel
          </button>
        </div>
      </div>

      {/* Trial end date */}
      <div>
        <label className="text-[11px] text-gray-500 uppercase tracking-wider block mb-2 font-semibold">Trial End Date</label>
        <input type="date" value={trialDate} onChange={(e) => setTrialDate(e.target.value)}
          className="w-full bg-[#0d0d0f] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand/50" />
        <div className="grid grid-cols-4 gap-1.5 mt-2">
          {[3, 7, 14, 30].map((d) => (
            <button key={d} onClick={() => extendTrial(d)}
              className="text-[11px] py-1.5 border border-white/10 text-gray-500 hover:border-yellow-700 hover:text-yellow-400 rounded-lg transition-colors font-semibold">
              +{d}d
            </button>
          ))}
        </div>
      </div>

      {/* Razorpay IDs (read-only display) */}
      {(rzpSub || rzpCustomer) && (
        <div className="bg-[#0d0d0f] border border-white/5 rounded-xl p-4 space-y-2">
          <p className="text-[11px] text-gray-600 uppercase tracking-wider font-semibold mb-2">Razorpay</p>
          {rzpSub && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Sub ID</span>
              <span className="font-mono text-gray-400">{rzpSub}</span>
            </div>
          )}
          {rzpCustomer && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Customer ID</span>
              <span className="font-mono text-gray-400">{rzpCustomer}</span>
            </div>
          )}
        </div>
      )}

      {/* Admin note */}
      <div>
        <label className="text-[11px] text-gray-500 uppercase tracking-wider block mb-2 font-semibold">
          Internal Note
        </label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
          placeholder="Payment ref, WhatsApp proof, custom deal, reason for override..."
          className="w-full bg-[#0d0d0f] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand/50 resize-none placeholder:text-gray-700" />
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800/30 text-red-400 text-xs rounded-xl px-4 py-3">{error}</div>
      )}

      <button onClick={save} disabled={saving}
        className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
          saved ? "bg-green-700 text-white" : "bg-brand hover:bg-brand-deep text-white disabled:opacity-40"
        }`}>
        {saving ? "Saving…" : saved ? "✓ Changes Saved" : "Save Changes"}
      </button>

      <p className="text-center text-xs text-gray-700">Changes apply instantly. No notification sent to user.</p>
    </div>
  );
}
