"use client";

import { useState } from "react";

interface Props {
  agencyId: string;
  currentPlan: string;
  currentStatus: string;
  trialEndsAt: string | null;
  adminNote: string;
}

const PLANS = ["STARTER", "PRO", "ENTERPRISE"];
const STATUSES = ["TRIAL", "ACTIVE", "PAST_DUE", "CANCELLED"];

export function AdminSubscriptionForm({ agencyId, currentPlan, currentStatus, trialEndsAt, adminNote }: Props) {
  const [plan, setPlan] = useState(currentPlan);
  const [status, setStatus] = useState(currentStatus);
  const [trialDate, setTrialDate] = useState(
    trialEndsAt ? new Date(trialEndsAt).toISOString().split("T")[0] : ""
  );
  const [note, setNote] = useState(adminNote);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
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
        const data = await res.json();
        setError(data.error ?? "Save failed");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Quick-action helpers
  const activateTrial = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setTrialDate(d.toISOString().split("T")[0]);
    setStatus("TRIAL");
  };

  return (
    <div className="space-y-4">
      {/* Plan */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Plan</label>
        <div className="flex gap-2">
          {PLANS.map((p) => (
            <button
              key={p}
              onClick={() => setPlan(p)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                plan === p
                  ? p === "STARTER"
                    ? "bg-blue-600 border-blue-500 text-white"
                    : p === "PRO"
                    ? "bg-purple-600 border-purple-500 text-white"
                    : "bg-yellow-600 border-yellow-500 text-white"
                  : "border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Status</label>
        <div className="grid grid-cols-2 gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                status === s
                  ? s === "ACTIVE"
                    ? "bg-green-700 border-green-600 text-white"
                    : s === "TRIAL"
                    ? "bg-yellow-700 border-yellow-600 text-white"
                    : s === "PAST_DUE"
                    ? "bg-orange-700 border-orange-600 text-white"
                    : "bg-red-700 border-red-600 text-white"
                  : "border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Trial end date */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Trial Ends At</label>
        <input
          type="date"
          value={trialDate}
          onChange={(e) => setTrialDate(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand/60"
        />
        <div className="flex gap-2 mt-2">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => activateTrial(days)}
              className="flex-1 text-xs py-1 border border-gray-700 text-gray-400 hover:border-yellow-600 hover:text-yellow-300 rounded-lg transition-colors"
            >
              +{days}d trial
            </button>
          ))}
        </div>
      </div>

      {/* Admin note */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Admin Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Payment reference, WhatsApp confirmation, custom deal..."
          className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand/60 resize-none placeholder:text-gray-600"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
          saved
            ? "bg-green-700 text-white"
            : "bg-brand text-white hover:bg-brand-deep disabled:opacity-50"
        }`}
      >
        {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
      </button>

      <p className="text-xs text-gray-600 text-center">
        Changes apply immediately — no email is sent to the user.
      </p>
    </div>
  );
}
