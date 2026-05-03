"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Zap, Building2, Loader2, ArrowRight, Users, Sparkles, Calendar } from "lucide-react";

const STEPS = [
  { icon: Building2, label: "Agency Setup" },
  { icon: Users, label: "Add Clients" },
  { icon: Sparkles, label: "Generate Content" },
  { icon: Calendar, label: "Auto-Post" },
];

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [agencyName, setAgencyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill with user's name if available
  useEffect(() => {
    if (session?.user?.name && !agencyName) {
      setAgencyName(`${session.user.name}'s Agency`);
    }
  }, [session?.user?.name]);

  // If user already has an agency, skip onboarding
  useEffect(() => {
    if (status === "authenticated" && session?.user?.agencyId) {
      router.replace("/dashboard");
    }
  }, [status, session?.user?.agencyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyName.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/agency/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyName: agencyName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Force session refresh so agencyId is in the token
      await update({ agencyId: data.agency.id, agencyName: data.agency.name });

      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-12">
        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-bold text-lg">AutoDocks</span>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-12">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i === 0
                  ? "bg-brand text-white"
                  : "bg-surface-warm border border-border-strong text-muted-fg"
              }`}
            >
              {i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-8 h-px bg-border-strong" />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-surface border border-[var(--color-border)] rounded-2xl p-8 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-6">
          <Building2 className="w-6 h-6 text-brand" />
        </div>

        <h1 className="font-display font-bold text-2xl tracking-tight mb-2">
          Set up your agency
        </h1>
        <p className="text-sm text-muted mb-8 leading-relaxed">
          Welcome, {session?.user?.name?.split(" ")[0] || "there"}! What's your
          agency called? You can change this later.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-danger-bg border border-danger/20 text-danger text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted mb-1.5 block">
              Agency Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg" />
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="Brand Docks"
                required
                autoFocus
                className="w-full bg-[var(--background)] border border-border-strong rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-muted-fg focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
              />
            </div>
            <p className="text-xs text-muted-fg mt-1.5">
              This is how your agency appears in AutoDocks.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !agencyName.trim()}
            className="w-full bg-brand text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-brand-deep transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                Continue to Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* What's next hint */}
      <div className="mt-8 max-w-md w-full">
        <p className="text-xs text-muted-fg text-center mb-4">After this, you'll:</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Users, label: "Add your first client" },
            { icon: Sparkles, label: "Generate a content calendar" },
            { icon: Calendar, label: "Schedule & auto-post" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="bg-surface border border-[var(--color-border)] rounded-xl p-3 text-center"
            >
              <Icon className="w-4 h-4 text-brand mx-auto mb-1.5" />
              <p className="text-xs text-muted leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
