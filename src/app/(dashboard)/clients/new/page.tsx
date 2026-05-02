"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Palette,
  MessageSquare,
  Target,
  Hash,
  Globe,
  Camera,
  Plus,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = [
  { value: "professional", label: "Professional", desc: "Formal & trustworthy" },
  { value: "casual", label: "Casual", desc: "Friendly & approachable" },
  { value: "witty", label: "Witty", desc: "Smart & humorous" },
  { value: "bold", label: "Bold", desc: "Confident & direct" },
  { value: "inspirational", label: "Inspirational", desc: "Motivational & uplifting" },
];

const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "hinglish", label: "Hinglish" },
  { value: "gujarati", label: "Gujarati" },
];

const NICHE_SUGGESTIONS = [
  "Healthcare", "Education", "Real Estate", "Food & Restaurant",
  "Fitness", "Fashion", "Technology", "Finance", "Legal",
  "Beauty & Salon", "Automotive", "Travel", "E-commerce", "Other",
];

export default function AddClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pillarInput, setPillarInput] = useState("");
  const [competitorInput, setCompetitorInput] = useState("");

  const [form, setForm] = useState({
    businessName: "",
    niche: "",
    brandColors: ["#D4764E", "#1A1A1A", "#FFFFFF"],
    toneOfVoice: "professional",
    targetAudience: "",
    contentLanguage: "hinglish",
    contentPillars: [] as string[],
    competitors: [] as string[],
    extraContext: "",
  });

  const update = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addPillar = () => {
    if (pillarInput.trim() && form.contentPillars.length < 5) {
      update("contentPillars", [...form.contentPillars, pillarInput.trim()]);
      setPillarInput("");
    }
  };

  const removePillar = (index: number) => {
    update("contentPillars", form.contentPillars.filter((_, i) => i !== index));
  };

  const addCompetitor = () => {
    if (competitorInput.trim() && form.competitors.length < 5) {
      update("competitors", [...form.competitors, competitorInput.trim()]);
      setCompetitorInput("");
    }
  };

  const removeCompetitor = (index: number) => {
    update("competitors", form.competitors.filter((_, i) => i !== index));
  };

  const updateColor = (index: number, color: string) => {
    const newColors = [...form.brandColors];
    newColors[index] = color;
    update("brandColors", newColors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/clients");
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Link>
        <h1 className="font-display font-bold text-2xl tracking-tight mb-1">
          Add New Client
        </h1>
        <p className="text-sm text-muted">
          Set up the brand profile. AI will use this for all content generation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ═══ BASIC INFO ═══ */}
        <section className="bg-surface border border-[var(--color-border)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-brand" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm">Business Info</h2>
              <p className="text-xs text-muted">Basic details about the client</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted mb-1.5 block">Business Name *</label>
              <input type="text" value={form.businessName} onChange={(e) => update("businessName", e.target.value)} placeholder="e.g., Kalp Hospital" required className="w-full bg-[var(--background)] border border-border-strong rounded-xl px-4 py-3 text-sm placeholder:text-muted-fg focus:border-brand focus:ring-1 focus:ring-brand outline-none" />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted mb-1.5 block">Industry/Niche *</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {NICHE_SUGGESTIONS.map((n) => (
                  <button key={n} type="button" onClick={() => update("niche", n)}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      form.niche === n ? "bg-brand-50 border-brand-100 text-brand" : "bg-[var(--background)] border-border-strong text-muted hover:border-brand-100"
                    )}>
                    {n}
                  </button>
                ))}
              </div>
              <input type="text" value={form.niche} onChange={(e) => update("niche", e.target.value)} placeholder="Or type custom niche..." className="w-full bg-[var(--background)] border border-border-strong rounded-xl px-4 py-3 text-sm placeholder:text-muted-fg focus:border-brand focus:ring-1 focus:ring-brand outline-none" />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted mb-1.5 block">Target Audience *</label>
              <input type="text" value={form.targetAudience} onChange={(e) => update("targetAudience", e.target.value)} placeholder="e.g., Adults 30-60 in Junagadh seeking orthopedic treatment" required className="w-full bg-[var(--background)] border border-border-strong rounded-xl px-4 py-3 text-sm placeholder:text-muted-fg focus:border-brand focus:ring-1 focus:ring-brand outline-none" />
            </div>
          </div>
        </section>

        {/* ═══ BRAND COLORS ═══ */}
        <section className="bg-surface border border-[var(--color-border)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <Palette className="w-4 h-4 text-brand" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm">Brand Colors</h2>
              <p className="text-xs text-muted">Used for AI image generation</p>
            </div>
          </div>

          <div className="flex gap-4">
            {["Primary", "Secondary", "Accent"].map((label, i) => (
              <div key={label} className="flex-1">
                <label className="text-xs font-semibold text-muted mb-1.5 block">{label}</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.brandColors[i]} onChange={(e) => updateColor(i, e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border-strong cursor-pointer" />
                  <input type="text" value={form.brandColors[i]} onChange={(e) => updateColor(i, e.target.value)}
                    className="flex-1 bg-[var(--background)] border border-border-strong rounded-lg px-3 py-2 text-xs font-mono focus:border-brand focus:ring-1 focus:ring-brand outline-none" />
                </div>
              </div>
            ))}
          </div>

          {/* Color Preview */}
          <div className="flex gap-2 mt-4">
            {form.brandColors.map((color, i) => (
              <div key={i} className="flex-1 h-8 rounded-lg" style={{ backgroundColor: color }} />
            ))}
          </div>
        </section>

        {/* ═══ TONE & LANGUAGE ═══ */}
        <section className="bg-surface border border-[var(--color-border)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-brand" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm">Tone & Language</h2>
              <p className="text-xs text-muted">How should the content sound?</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted mb-2 block">Tone of Voice</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TONES.map((t) => (
                  <button key={t.value} type="button" onClick={() => update("toneOfVoice", t.value)}
                    className={cn("text-left px-4 py-3 rounded-xl border transition-all",
                      form.toneOfVoice === t.value ? "bg-brand-50 border-brand-100" : "bg-[var(--background)] border-border-strong hover:border-brand-100"
                    )}>
                    <p className={cn("text-sm font-semibold", form.toneOfVoice === t.value ? "text-brand" : "")}>{t.label}</p>
                    <p className="text-xs text-muted-fg">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted mb-2 block">Content Language</label>
              <div className="flex gap-2">
                {LANGUAGES.map((l) => (
                  <button key={l.value} type="button" onClick={() => update("contentLanguage", l.value)}
                    className={cn("px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                      form.contentLanguage === l.value ? "bg-brand-50 border-brand-100 text-brand" : "bg-[var(--background)] border-border-strong text-muted hover:border-brand-100"
                    )}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CONTENT PILLARS ═══ */}
        <section className="bg-surface border border-[var(--color-border)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <Target className="w-4 h-4 text-brand" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm">Content Pillars</h2>
              <p className="text-xs text-muted">3-5 topics this client posts about (e.g., tips, behind-the-scenes, promotions)</p>
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <input type="text" value={pillarInput} onChange={(e) => setPillarInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPillar())}
              placeholder="e.g., Patient Education" className="flex-1 bg-[var(--background)] border border-border-strong rounded-xl px-4 py-3 text-sm placeholder:text-muted-fg focus:border-brand focus:ring-1 focus:ring-brand outline-none" />
            <button type="button" onClick={addPillar} disabled={form.contentPillars.length >= 5}
              className="bg-brand text-white px-4 rounded-xl text-sm font-semibold hover:bg-brand-deep transition-colors disabled:opacity-30">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {form.contentPillars.map((p, i) => (
              <span key={i} className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand text-sm px-3 py-1.5 rounded-lg font-medium">
                {p}
                <button type="button" onClick={() => removePillar(i)}><X className="w-3 h-3" /></button>
              </span>
            ))}
            {form.contentPillars.length === 0 && (
              <p className="text-xs text-muted-fg">Add at least 3 content pillars for best results</p>
            )}
          </div>
        </section>

        {/* ═══ COMPETITORS ═══ */}
        <section className="bg-surface border border-[var(--color-border)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <Camera className="w-4 h-4 text-brand" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm">Competitor Handles (optional)</h2>
              <p className="text-xs text-muted">Instagram handles of competitors for style reference</p>
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <input type="text" value={competitorInput} onChange={(e) => setCompetitorInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCompetitor())}
              placeholder="@competitor_handle" className="flex-1 bg-[var(--background)] border border-border-strong rounded-xl px-4 py-3 text-sm placeholder:text-muted-fg focus:border-brand focus:ring-1 focus:ring-brand outline-none" />
            <button type="button" onClick={addCompetitor} disabled={form.competitors.length >= 5}
              className="bg-foreground text-background px-4 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-30">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {form.competitors.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-2 bg-surface-warm border border-border-strong text-sm px-3 py-1.5 rounded-lg font-medium">
                {c}
                <button type="button" onClick={() => removeCompetitor(i)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        </section>

        {/* ═══ EXTRA CONTEXT ═══ */}
        <section className="bg-surface border border-[var(--color-border)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <Hash className="w-4 h-4 text-brand" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm">Additional Context (optional)</h2>
              <p className="text-xs text-muted">Any special instructions for the AI</p>
            </div>
          </div>

          <textarea value={form.extraContext} onChange={(e) => update("extraContext", e.target.value)}
            placeholder="e.g., Never mention competitor names. Always include a call to action. Post timings should be 7-9 PM IST."
            rows={4} className="w-full bg-[var(--background)] border border-border-strong rounded-xl px-4 py-3 text-sm placeholder:text-muted-fg focus:border-brand focus:ring-1 focus:ring-brand outline-none resize-none" />
        </section>

        {/* ═══ SUBMIT ═══ */}
        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 bg-brand text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-brand-deep transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Creating..." : "Create Client & Start Generating"}
          </button>
          <Link href="/clients" className="text-sm text-muted hover:text-foreground transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
