"use client";

import { Settings, CreditCard, User, Shield, Zap } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="animate-in max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl tracking-tight mb-1">Settings</h1>
        <p className="text-sm text-muted">Manage your account and subscription.</p>
      </div>

      <div className="space-y-6">
        {/* Current Plan */}
        <section className="bg-surface border border-[var(--color-border)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-brand" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm">Subscription</h2>
              <p className="text-xs text-muted">Your current plan and usage</p>
            </div>
          </div>

          <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold text-brand">Starter Plan</span>
              <span className="text-sm font-semibold text-brand">₹499/mo</span>
            </div>
            <p className="text-xs text-muted mb-4">3 clients · 90 posts/month · Auto-posting</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted">Clients</span>
                  <span className="font-semibold">0 / 3</span>
                </div>
                <div className="h-1.5 bg-brand-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full" style={{ width: "0%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted">Posts</span>
                  <span className="font-semibold">0 / 90</span>
                </div>
                <div className="h-1.5 bg-brand-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full" style={{ width: "0%" }} />
                </div>
              </div>
            </div>
          </div>

          <button className="w-full bg-foreground text-background py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" />
            Upgrade to Pro — ₹999/mo
          </button>
        </section>

        {/* Profile */}
        <section className="bg-surface border border-[var(--color-border)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <User className="w-4 h-4 text-brand" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm">Profile</h2>
              <p className="text-xs text-muted">Your account details</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted mb-1.5 block">Agency Name</label>
              <input type="text" defaultValue="" placeholder="Your agency name" className="w-full bg-[var(--background)] border border-border-strong rounded-xl px-4 py-3 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted mb-1.5 block">Email</label>
              <input type="email" defaultValue="" placeholder="you@agency.com" disabled className="w-full bg-[var(--background)] border border-border-strong rounded-xl px-4 py-3 text-sm opacity-60" />
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="bg-surface border border-[var(--color-border)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-brand" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm">Security</h2>
              <p className="text-xs text-muted">Password and account security</p>
            </div>
          </div>
          <button className="text-sm font-semibold text-brand hover:underline">
            Change password
          </button>
        </section>
      </div>
    </div>
  );
}
