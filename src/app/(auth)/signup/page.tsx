"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Zap, Mail, Lock, User, Building2, Loader2, CheckCircle2 } from "lucide-react";

const BENEFITS = [
  "3 clients included free",
  "AI-generated captions & images",
  "Auto-posting to Instagram",
  "Indian festival calendar built-in",
  "Cancel anytime — no contracts",
];

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", agencyName: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Auto sign in after signup
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        callbackUrl: "/dashboard",
      });
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Left — Brand panel */}
      <div className="hidden lg:flex flex-1 bg-surface-warm items-center justify-center p-12 border-r border-[var(--color-border)]">
        <div className="max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-8">
            <Zap className="w-8 h-8 text-brand" />
          </div>
          <h2 className="font-display font-bold text-3xl tracking-tight mb-4">
            7 days free. Full access. No card needed.
          </h2>
          <p className="text-muted leading-relaxed mb-10">
            Set up your first client in 2 minutes. Generate a full month of
            content before your trial ends.
          </p>
          <ul className="space-y-4">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-sm text-foreground">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2.5 mb-12">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg">AutoDocks</span>
          </Link>

          <h1 className="font-display font-bold text-2xl tracking-tight mb-2">
            Start your free trial
          </h1>
          <p className="text-sm text-muted mb-8">
            7 days free · No credit card required
          </p>

          {/* Google OAuth */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
            className="w-full flex items-center justify-center gap-3 bg-surface border border-border-strong rounded-xl px-4 py-3.5 text-sm font-semibold hover:bg-surface-warm transition-colors mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border-strong" />
            <span className="text-xs text-muted-fg font-medium">or</span>
            <div className="flex-1 h-px bg-border-strong" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-danger-bg border border-danger/20 text-danger text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted mb-1.5 block">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg" />
                  <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Abhay" required className="w-full bg-surface border border-border-strong rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-muted-fg focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted mb-1.5 block">Agency Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg" />
                  <input type="text" value={form.agencyName} onChange={(e) => update("agencyName", e.target.value)} placeholder="Brand Docks" required className="w-full bg-surface border border-border-strong rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-muted-fg focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg" />
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@agency.com" required className="w-full bg-surface border border-border-strong rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-muted-fg focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg" />
                <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Min 8 characters" required minLength={8} className="w-full bg-surface border border-border-strong rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-muted-fg focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-brand text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-brand-deep transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creating account..." : "Create free account"}
            </button>
          </form>

          <p className="text-xs text-muted-fg mt-6 text-center">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>

          <p className="text-sm text-muted mt-6 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-brand font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
