"use client";

import { useState, useCallback } from "react";
import {
  Sparkles,
  ChevronDown,
  Loader2,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { CalendarGrid, GeneratedPostData } from "./CalendarGrid";

interface Client {
  id: string;
  businessName: string;
  niche: string;
  brandColors: string[];
}

interface ContentMix {
  educational: number;
  promotional: number;
  engagement: number;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const POSTS_PER_WEEK_OPTIONS = [
  { value: 3, label: "3/week", desc: "Minimal · ~12/mo" },
  { value: 5, label: "5/week", desc: "Standard · ~20/mo" },
  { value: 7, label: "7/week", desc: "Daily · ~28/mo" },
];

const GENERATION_STEPS = [
  "Analysing brand profile...",
  "Building content strategy...",
  "Writing captions...",
  "Crafting hashtag sets...",
  "Finalising calendar...",
];

export function GenerateCalendarForm({
  clients,
  preselectedClientId,
}: {
  clients: Client[];
  preselectedClientId?: string;
}) {
  const now = new Date();
  const defaultClientId =
    preselectedClientId && clients.find((c) => c.id === preselectedClientId)
      ? preselectedClientId
      : clients[0]?.id ?? "";

  const [selectedClientId, setSelectedClientId] = useState(defaultClientId);
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-indexed
  const [year, setYear] = useState(now.getFullYear());
  const [postsPerWeek, setPostsPerWeek] = useState(5);
  const [contentMix, setContentMix] = useState<ContentMix>({
    educational: 40,
    promotional: 30,
    engagement: 30,
  });

  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPostData[] | null>(null);
  const [calendarMeta, setCalendarMeta] = useState<{
    id: string;
    clientName: string;
    month: number;
    year: number;
  } | null>(null);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // Content mix must sum to 100
  const updateMix = (key: keyof ContentMix, val: number) => {
    const clamped = Math.min(100, Math.max(0, val));
    const others = (["educational", "promotional", "engagement"] as const).filter(
      (k) => k !== key
    );
    const remaining = 100 - clamped;
    const currentOthersTotal = others.reduce((s, k) => s + contentMix[k], 0);
    const ratio = currentOthersTotal === 0 ? 0.5 : 1;
    const newMix = { ...contentMix, [key]: clamped };
    if (currentOthersTotal > 0) {
      const scale = remaining / currentOthersTotal;
      others.forEach((k) => {
        newMix[k] = Math.round(contentMix[k] * scale);
      });
    } else {
      const half = Math.floor(remaining / 2);
      newMix[others[0]] = half;
      newMix[others[1]] = remaining - half;
    }
    // fix rounding drift
    const total = newMix.educational + newMix.promotional + newMix.engagement;
    if (total !== 100) newMix.engagement += 100 - total;
    setContentMix(newMix);
    void ratio; // suppress lint
  };

  const animateSteps = useCallback(() => {
    setStepIndex(0);
    const interval = setInterval(() => {
      setStepIndex((i) => {
        if (i >= GENERATION_STEPS.length - 1) {
          clearInterval(interval);
          return i;
        }
        return i + 1;
      });
    }, 1800);
    return interval;
  }, []);

  const handleGenerate = async () => {
    if (!selectedClientId) return;
    setLoading(true);
    setError("");
    setGeneratedPosts(null);
    setCalendarMeta(null);

    const stepTimer = animateSteps();

    try {
      const res = await fetch("/api/generate/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          month,
          year,
          postsPerWeek,
          contentMix,
        }),
      });

      clearInterval(stepTimer);

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Generation failed. Please try again.");
        return;
      }

      setGeneratedPosts(data.posts);
      setCalendarMeta({
        id: data.calendar.id,
        clientName: data.calendar.clientName,
        month: data.calendar.month,
        year: data.calendar.year,
      });
    } catch {
      clearInterval(stepTimer);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
      setStepIndex(0);
    }
  };

  const handleReset = () => {
    setGeneratedPosts(null);
    setCalendarMeta(null);
    setError("");
  };

  // Share state
  const [shareLoading, setShareLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareError, setShareError] = useState("");

  const handleShare = async () => {
    if (!calendarMeta?.id) return;
    setShareLoading(true);
    setShareError("");
    try {
      const res = await fetch(`/api/calendar/${calendarMeta.id}/share`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setShareError(data.error || "Failed to get share link"); return; }
      await navigator.clipboard.writeText(data.shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    } catch {
      setShareError("Could not copy link. Please try again.");
    } finally {
      setShareLoading(false);
    }
  };

  // ── GENERATED VIEW ──────────────────────────────────────────────────────
  if (generatedPosts && calendarMeta) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <h2 className="font-display font-bold text-lg">
                {calendarMeta.clientName} — {MONTHS[calendarMeta.month - 1]}{" "}
                {calendarMeta.year}
              </h2>
            </div>
            <p className="text-sm text-muted">
              {generatedPosts.length} posts generated · Click any post to view, edit, or approve
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Share with Client button */}
            <button
              onClick={handleShare}
              disabled={shareLoading}
              className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-deep transition-colors disabled:opacity-60"
            >
              {shareLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : shareCopied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              {shareCopied ? "Link Copied!" : "Share with Client"}
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 bg-surface-warm border border-border-strong px-4 py-2 rounded-xl text-sm font-semibold hover:bg-surface transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              New Calendar
            </button>
          </div>
        </div>
        {shareError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4">
            {shareError}
          </p>
        )}
        {shareCopied && (
          <div className="flex items-center gap-2 text-sm text-success bg-success-bg border border-success/20 rounded-xl px-4 py-2.5 mb-4">
            <Copy className="w-4 h-4" />
            Approval link copied to clipboard! Send it to your client via WhatsApp or email.
          </div>
        )}
        <CalendarGrid
          posts={generatedPosts}
          month={calendarMeta.month}
          year={calendarMeta.year}
          calendarId={calendarMeta.id}
          clientName={calendarMeta.clientName}
        />
      </div>
    );
  }

  // ── FORM VIEW ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl">
      {/* Client selector */}
      <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-6 mb-4">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
          Select Client
        </h3>
        <div className="grid gap-2">
          {clients.map((c) => {
            const color = c.brandColors[0] ?? "#D4764E";
            const initials = c.businessName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <button
                key={c.id}
                onClick={() => setSelectedClientId(c.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  selectedClientId === c.id
                    ? "border-brand bg-brand-50"
                    : "border-border-strong hover:border-brand-100 hover:bg-surface-warm"
                }`}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{c.businessName}</p>
                  <p className="text-xs text-muted">{c.niche}</p>
                </div>
                {selectedClientId === c.id && (
                  <CheckCircle2 className="w-4 h-4 text-brand flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Month / Year */}
      <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-6 mb-4">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
          Month & Year
        </h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full appearance-none bg-surface-warm border border-border-strong rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand pr-10"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative w-32">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full appearance-none bg-surface-warm border border-border-strong rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand pr-10"
            >
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
            <ChevronDown className="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Posts per week */}
      <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-6 mb-4">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
          Posts Per Week
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {POSTS_PER_WEEK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPostsPerWeek(opt.value)}
              className={`p-3 rounded-xl border text-center transition-all ${
                postsPerWeek === opt.value
                  ? "border-brand bg-brand-50"
                  : "border-border-strong hover:border-brand-100"
              }`}
            >
              <p
                className={`font-display font-bold text-sm ${
                  postsPerWeek === opt.value ? "text-brand" : ""
                }`}
              >
                {opt.label}
              </p>
              <p className="text-xs text-muted mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Content mix */}
      <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-6 mb-6">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
          Content Mix
        </h3>
        <div className="space-y-4">
          {(
            [
              { key: "educational", label: "Educational", color: "bg-info", desc: "Tips, how-tos, insights" },
              { key: "promotional", label: "Promotional", color: "bg-brand", desc: "Products, offers, services" },
              { key: "engagement", label: "Engagement", color: "bg-success", desc: "Polls, questions, community" },
            ] as const
          ).map(({ key, label, color, desc }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-xs text-muted ml-2">{desc}</span>
                </div>
                <span className="text-sm font-bold tabular-nums w-10 text-right">
                  {contentMix[key]}%
                </span>
              </div>
              <div className="relative">
                <div className="h-1.5 bg-surface-warm rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all`}
                    style={{ width: `${contentMix[key]}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={contentMix[key]}
                  onChange={(e) => updateMix(key, Number(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-1.5"
                />
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-fg text-right">
            Total: {contentMix.educational + contentMix.promotional + contentMix.engagement}%
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {/* Generate button */}
      {loading ? (
        <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-8 text-center">
          <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto mb-4" />
          <p className="font-display font-bold text-base mb-2">Generating your calendar...</p>
          <div className="space-y-2 max-w-xs mx-auto">
            {GENERATION_STEPS.map((step, i) => (
              <div
                key={step}
                className={`flex items-center gap-2 text-sm transition-all ${
                  i < stepIndex
                    ? "text-success"
                    : i === stepIndex
                    ? "text-foreground font-medium"
                    : "text-muted-fg"
                }`}
              >
                {i < stepIndex ? (
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                ) : i === stepIndex ? (
                  <Loader2 className="w-3.5 h-3.5 flex-shrink-0 animate-spin" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-border-strong flex-shrink-0" />
                )}
                {step}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-4">Usually takes 20–60 seconds</p>
        </div>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={!selectedClientId}
          className="w-full flex items-center justify-center gap-2 bg-brand text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-brand-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4" />
          Generate{" "}
          {selectedClient ? `Calendar for ${selectedClient.businessName}` : "Calendar"}
          {" "}·{" "}
          <span className="opacity-80">
            {MONTHS[month - 1]} {year}
          </span>
        </button>
      )}

      {/* Helper note */}
      {!loading && (
        <p className="text-xs text-muted text-center mt-3">
          <Calendar className="w-3 h-3 inline mr-1" />
          AI will generate ~{postsPerWeek * 4} posts with full captions, hashtags, and image
          directions
        </p>
      )}
    </div>
  );
}
