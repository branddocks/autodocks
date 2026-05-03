"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Palette,
  MessageSquare,
  Target,
  Camera,
  Hash,
  Plus,
  X,
  Loader2,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
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

type ClientData = {
  id: string;
  businessName: string;
  niche: string;
  brandColors: string[];
  toneOfVoice: string;
  targetAudience: string;
  contentLanguage: string;
  contentPillars: string[];
  competitors: string[];
  extraContext: string;
};

export function ClientEditForm({ client }: { client: ClientData }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [pillarInput, setPillarInput] = useState("");
  const [competitorInput, setCompetitorInput] = useState("");

  const [form, setForm] = useState<ClientData>({ ...client });

  const update = (key: keyof ClientData, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const updateColor = (index: number, color: string) => {
    const newColors = [...form.brandColors];
    newColors[index] = color;
    update("brandColors", newColors);
  };

  const addPillar = () => {
    if (pillarInput.trim() && form.contentPillars.length < 5) {
      update("contentPillars", [...form.contentPillars, pillarInput.trim()]);
      setPillarInput("");
    }
  };

  const removePillar = (i: number) =>
    update("contentPillars", form.contentPillars.filter((_, idx) => idx !== i));

  const addCompetitor = () => {
    if (competitorInput.trim() && form.competitors.length < 5) {
      update("competitors", [...form.competitors, competitorInput.trim()]);
      setCompetitorInput("");
    }
  };

  const removeCompetitor = (i: number) =>
    update("competitors", form.competitors.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!form.businessName.trim() || !form.niche.trim() || !form.targetAudience.trim()) {
      setError("Business name, niche, and target audience are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update client.");
        setLoading(false);
        return;
      }

      setSuccess("Client profile updated successfully.");
      setIsOpen(false);
      router.refresh(); // Re-fetch server component data
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/clients");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to remove client.");
        setShowDeleteConfirm(false);
        setDeleting(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <div className="bg-surface border border-[var(--color-border)] rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setSuccess("");
          setError("");
        }}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-warm transition-colors"
      >
        <div className="flex items-center gap-3">
          <Pencil className="w-4 h-4 text-brand" />
          <span className="font-display font-bold text-sm">Edit Brand Profile</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-fg" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-fg" />
        )}
      </button>

      {/* Success message */}
      {success && !isOpen && (
        <div className="mx-6 mb-4 bg-success-bg border border-success/20 text-success text-sm px-4 py-3 rounded-xl">
          {success}
        </div>
      )}

      {/* Edit form */}
      {isOpen && (
        <div className="px-6 pb-6 space-y-6 border-t border-[var(--color-border)]">
          <div className="pt-5 space-y-6">

            {/* Business Info */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-4 h-4 text-brand" />
                <h3 className="font-display font-bold text-sm">Business Info</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted mb-1.5 block">Business Name *</label>
                  <input type="text" value={form.businessName}
                    onChange={(e) => update("businessName", e.target.value)}
                    className="w-full bg-[var(--background)] border border-border-strong rounded-xl px-4 py-3 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted mb-1.5 block">Industry/Niche *</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {NICHE_SUGGESTIONS.map((n) => (
                      <button key={n} type="button" onClick={() => update("niche", n)}
                        className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                          form.niche === n ? "bg-brand-50 border-brand-100 text-brand" : "bg-[var(--background)] border-border-strong text-muted hover:border-brand-100")}>
                        {n}
                      </button>
                    ))}
                  </div>
                  <input type="text" value={form.niche}
                    onChange={(e) => update("niche", e.target.value)}
                    placeholder="Or type custom niche..."
                    className="w-full bg-[var(--background)] border border-border-strong rounded-xl px-4 py-3 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted mb-1.5 block">Target Audience *</label>
                  <input type="text" value={form.targetAudience}
                    onChange={(e) => update("targetAudience", e.target.value)}
                    className="w-full bg-[var(--background)] border border-border-strong rounded-xl px-4 py-3 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none" />
                </div>
              </div>
            </section>

            {/* Brand Colors */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-4 h-4 text-brand" />
                <h3 className="font-display font-bold text-sm">Brand Colors</h3>
              </div>
              <div className="flex gap-4">
                {["Primary", "Secondary", "Accent"].map((label, i) => (
                  <div key={label} className="flex-1">
                    <label className="text-xs font-semibold text-muted mb-1.5 block">{label}</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={form.brandColors[i] || "#000000"}
                        onChange={(e) => updateColor(i, e.target.value)}
                        className="w-10 h-10 rounded-lg border border-border-strong cursor-pointer" />
                      <input type="text" value={form.brandColors[i] || "#000000"}
                        onChange={(e) => updateColor(i, e.target.value)}
                        className="flex-1 bg-[var(--background)] border border-border-strong rounded-lg px-3 py-2 text-xs font-mono focus:border-brand outline-none" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                {form.brandColors.map((color, i) => (
                  <div key={i} className="flex-1 h-6 rounded-lg" style={{ backgroundColor: color }} />
                ))}
              </div>
            </section>

            {/* Tone & Language */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-brand" />
                <h3 className="font-display font-bold text-sm">Tone & Language</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted mb-2 block">Tone of Voice</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TONES.map((t) => (
                      <button key={t.value} type="button" onClick={() => update("toneOfVoice", t.value)}
                        className={cn("text-left px-3 py-2.5 rounded-xl border transition-all",
                          form.toneOfVoice === t.value ? "bg-brand-50 border-brand-100" : "bg-[var(--background)] border-border-strong hover:border-brand-100")}>
                        <p className={cn("text-xs font-semibold", form.toneOfVoice === t.value ? "text-brand" : "")}>{t.label}</p>
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
                          form.contentLanguage === l.value ? "bg-brand-50 border-brand-100 text-brand" : "bg-[var(--background)] border-border-strong text-muted hover:border-brand-100")}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Content Pillars */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-brand" />
                <h3 className="font-display font-bold text-sm">Content Pillars</h3>
              </div>
              <div className="flex gap-2 mb-3">
                <input type="text" value={pillarInput}
                  onChange={(e) => setPillarInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPillar())}
                  placeholder="Add a content pillar..."
                  className="flex-1 bg-[var(--background)] border border-border-strong rounded-xl px-4 py-2.5 text-sm focus:border-brand outline-none" />
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
              </div>
            </section>

            {/* Competitors */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-4 h-4 text-brand" />
                <h3 className="font-display font-bold text-sm">Competitor Handles</h3>
              </div>
              <div className="flex gap-2 mb-3">
                <input type="text" value={competitorInput}
                  onChange={(e) => setCompetitorInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCompetitor())}
                  placeholder="@handle"
                  className="flex-1 bg-[var(--background)] border border-border-strong rounded-xl px-4 py-2.5 text-sm focus:border-brand outline-none" />
                <button type="button" onClick={addCompetitor} disabled={form.competitors.length >= 5}
                  className="bg-foreground text-background px-4 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-30">
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

            {/* Extra Context */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-4 h-4 text-brand" />
                <h3 className="font-display font-bold text-sm">AI Instructions</h3>
              </div>
              <textarea value={form.extraContext}
                onChange={(e) => update("extraContext", e.target.value)}
                placeholder="Special instructions for the AI..."
                rows={3}
                className="w-full bg-[var(--background)] border border-border-strong rounded-xl px-4 py-3 text-sm focus:border-brand outline-none resize-none" />
            </section>

            {/* Error */}
            {error && (
              <div className="bg-danger-bg border border-danger/20 text-danger text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-brand-deep transition-colors disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 text-danger text-sm font-semibold hover:bg-danger-bg px-4 py-3 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Remove Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 rounded-full bg-danger-bg flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-danger" />
            </div>
            <h3 className="font-display font-bold text-lg text-center mb-2">
              Remove this client?
            </h3>
            <p className="text-sm text-muted text-center mb-6">
              All posts and calendars for{" "}
              <strong>{client.businessName}</strong> will be preserved but the
              client will be deactivated. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-surface-warm border border-border-strong px-4 py-3 rounded-xl font-semibold text-sm hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-danger text-white px-4 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? "Removing..." : "Yes, remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
