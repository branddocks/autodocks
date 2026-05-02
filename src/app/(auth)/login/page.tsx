"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Zap, Mail, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Left — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2.5 mb-12">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg">AutoDocks</span>
          </Link>

          <h1 className="font-display font-bold text-2xl tracking-tight mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-muted mb-8">
            Log in to manage your clients' content.
          </p>

          {/* Google OAuth */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
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

          {/* Email/Password */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-danger-bg border border-danger/20 text-danger text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@agency.com"
                  required
                  className="w-full bg-surface border border-border-strong rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-muted-fg focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-surface border border-border-strong rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-muted-fg focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-brand-deep transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-sm text-muted mt-8 text-center">
            Don't have an account?{" "}
            <Link href="/signup" className="text-brand font-semibold hover:underline">
              Start free trial
            </Link>
          </p>
        </div>
      </div>

      {/* Right — Brand panel (desktop only) */}
      <div className="hidden lg:flex flex-1 bg-surface-warm items-center justify-center p-12 border-l border-[var(--color-border)]">
        <div className="max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-8">
            <Zap className="w-8 h-8 text-brand" />
          </div>
          <h2 className="font-display font-bold text-3xl tracking-tight mb-4">
            Content that creates itself.
          </h2>
          <p className="text-muted leading-relaxed">
            AutoDocks generates branded social media content for all your clients
            — captions, images, and scheduling — so you can focus on strategy,
            not execution.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            <div>
              <p className="font-display font-bold text-2xl text-brand">60s</p>
              <p className="text-xs text-muted-fg mt-1">Calendar generation</p>
            </div>
            <div>
              <p className="font-display font-bold text-2xl text-brand">10x</p>
              <p className="text-xs text-muted-fg mt-1">Faster than manual</p>
            </div>
            <div>
              <p className="font-display font-bold text-2xl text-brand">24/7</p>
              <p className="text-xs text-muted-fg mt-1">Auto-posting</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
