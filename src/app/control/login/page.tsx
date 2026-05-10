"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ADMIN_EMAIL } from "@/lib/admin";

export default function ControlLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (email.toLowerCase().trim() !== ADMIN_EMAIL) {
      setError("This portal is restricted to authorised administrators only.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl: "/control",
      });

      if (result?.error) {
        setError("Invalid credentials. Please try again.");
        return;
      }

      router.push("/control");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">A</span>
            </div>
            <span className="text-white font-black text-xl">AutoDocks</span>
          </div>
          <div className="inline-block bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest mb-3">
            Control Panel
          </div>
          <p className="text-gray-500 text-sm">Restricted access. Administrators only.</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="admin@example.com"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/30 placeholder:text-gray-600"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/30 placeholder:text-gray-600"
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-xs rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-deep text-white font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Authenticating…" : "Access Control Panel"}
          </button>
        </form>

        <p className="text-center text-gray-700 text-xs mt-8">
          Unauthorised access attempts are logged.
        </p>
      </div>
    </div>
  );
}
