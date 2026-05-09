"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  Loader2,
  Image as ImageIcon,
  LayoutGrid,
  BookOpen,
  Type,
  Zap,
  Clock,
  Hash,
} from "lucide-react";

interface Post {
  id: string;
  caption: string;
  hashtags: string[];
  postType: string;
  contentPillar: string | null;
  scheduledAt: string | null;
  status: string;
  imagePrompt: string | null;
}

interface CalendarData {
  id: string;
  month: number;
  year: number;
  monthName: string;
  clientName: string;
  niche: string;
  accentColor: string;
  posts: Post[];
}

const POST_TYPE_LABELS: Record<string, string> = {
  SINGLE_IMAGE: "Image",
  CAROUSEL: "Carousel",
  STORY: "Story",
  TEXT_ONLY: "Text",
};

const POST_TYPE_ICON: Record<string, React.ReactNode> = {
  SINGLE_IMAGE: <ImageIcon className="w-3.5 h-3.5" />,
  CAROUSEL: <LayoutGrid className="w-3.5 h-3.5" />,
  STORY: <BookOpen className="w-3.5 h-3.5" />,
  TEXT_ONLY: <Type className="w-3.5 h-3.5" />,
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function formatTime(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export function ApprovalClient({ calendar }: { calendar: CalendarData }) {
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(calendar.posts.map((p) => [p.id, p.status]))
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedbackPostId, setFeedbackPostId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [error, setError] = useState("");

  const approvedCount = Object.values(statuses).filter((s) => s === "APPROVED").length;
  const rejectedCount = Object.values(statuses).filter((s) => s === "REJECTED").length;
  const total = calendar.posts.length;
  const progressPct = total > 0 ? Math.round(((approvedCount + rejectedCount) / total) * 100) : 0;

  const handleAction = async (postId: string, action: "APPROVED" | "REJECTED", feedback?: string) => {
    setLoadingId(postId);
    setError("");
    try {
      const res = await fetch(`/api/approve/${calendar.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, action, feedback }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setStatuses((prev) => ({ ...prev, [postId]: action }));
      if (feedbackPostId === postId) {
        setFeedbackPostId(null);
        setFeedbackText("");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoadingId(null);
      setFeedbackSubmitting(false);
    }
  };

  const openFeedback = (postId: string) => {
    setFeedbackPostId(postId);
    setFeedbackText("");
  };

  const submitFeedback = async (postId: string) => {
    if (!feedbackText.trim()) {
      await handleAction(postId, "REJECTED");
      return;
    }
    setFeedbackSubmitting(true);
    await handleAction(postId, "REJECTED", feedbackText.trim());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">AutoDocks</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Content Approval</p>
            <p className="text-sm font-semibold text-gray-900">
              {calendar.monthName} {calendar.year}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* ── Brief ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h1 className="font-bold text-xl text-gray-900 mb-1">
            {calendar.clientName} — {calendar.monthName} {calendar.year}
          </h1>
          <p className="text-sm text-gray-500 mb-5">
            Your agency has prepared {total} posts for this month. Review each one below and
            approve or request changes. Approved posts will be scheduled for publishing.
          </p>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-600 tabular-nums whitespace-nowrap">
              {approvedCount + rejectedCount}/{total} reviewed
            </span>
          </div>

          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {approvedCount} approved
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-red-500">
              <XCircle className="w-3.5 h-3.5" />
              {rejectedCount} changes requested
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* ── All Approved banner ── */}
        {approvedCount === total && total > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-emerald-800 text-lg">All posts approved!</p>
            <p className="text-sm text-emerald-600 mt-1">
              Your agency has been notified and will schedule the posts.
            </p>
          </div>
        )}

        {/* ── Posts ── */}
        <div className="space-y-4">
          {calendar.posts.map((post) => {
            const status = statuses[post.id];
            const isApproved = status === "APPROVED";
            const isRejected = status === "REJECTED";
            const isLoading = loadingId === post.id;
            const showFeedback = feedbackPostId === post.id;

            return (
              <div
                key={post.id}
                className={[
                  "bg-white rounded-2xl border transition-all duration-300",
                  isApproved ? "border-emerald-300 ring-1 ring-emerald-100" : "",
                  isRejected ? "border-red-300 ring-1 ring-red-50" : "",
                  !isApproved && !isRejected ? "border-gray-200" : "",
                ].join(" ")}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    {post.scheduledAt && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-medium">{formatDate(post.scheduledAt)}</span>
                        <span className="text-gray-400">·</span>
                        <span>{formatTime(post.scheduledAt)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {post.contentPillar && (
                      <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-medium">
                        {post.contentPillar}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                      {POST_TYPE_ICON[post.postType]}
                      {POST_TYPE_LABELS[post.postType] ?? post.postType}
                    </span>
                  </div>
                </div>

                {/* Status badge */}
                {(isApproved || isRejected) && (
                  <div className={[
                    "flex items-center gap-2 px-5 py-2.5 text-sm font-semibold",
                    isApproved ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600",
                  ].join(" ")}>
                    {isApproved ? (
                      <><CheckCircle2 className="w-4 h-4" /> Approved</>
                    ) : (
                      <><XCircle className="w-4 h-4" /> Changes Requested</>
                    )}
                  </div>
                )}

                {/* Caption */}
                <div className="px-5 py-4">
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                    {post.caption}
                  </p>
                </div>

                {/* Hashtags */}
                {post.hashtags.length > 0 && (
                  <div className="px-5 pb-4">
                    <div className="flex items-start gap-1.5 flex-wrap">
                      <Hash className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-indigo-600 leading-relaxed">
                        {post.hashtags.join(" ")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Image direction (optional) */}
                {post.imagePrompt && (
                  <div className="px-5 pb-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                      <p className="text-xs text-gray-500 font-medium mb-0.5">Visual Direction</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{post.imagePrompt}</p>
                    </div>
                  </div>
                )}

                {/* Feedback form */}
                {showFeedback && (
                  <div className="px-5 pb-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <p className="text-xs font-semibold text-amber-800 mb-2">
                        What would you like changed? (optional)
                      </p>
                      <textarea
                        className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
                        rows={3}
                        placeholder="e.g. Make the caption shorter, change the tone, different hashtags..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => submitFeedback(post.id)}
                          disabled={feedbackSubmitting}
                          className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60"
                        >
                          {feedbackSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                          Request Changes
                        </button>
                        <button
                          onClick={() => { setFeedbackPostId(null); setFeedbackText(""); }}
                          className="text-xs font-semibold text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                {!isApproved && !isRejected && !showFeedback && (
                  <div className="px-5 pb-5 flex gap-2">
                    <button
                      onClick={() => handleAction(post.id, "APPROVED")}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-60"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => openFeedback(post.id)}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Request Changes
                    </button>
                  </div>
                )}

                {/* Re-review buttons (allow changing mind) */}
                {(isApproved || isRejected) && !showFeedback && (
                  <div className="px-5 pb-4 flex gap-2">
                    {isRejected && (
                      <button
                        onClick={() => handleAction(post.id, "APPROVED")}
                        disabled={isLoading}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-60"
                      >
                        {isLoading ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : null}
                        Approve instead →
                      </button>
                    )}
                    {isApproved && (
                      <button
                        onClick={() => openFeedback(post.id)}
                        disabled={isLoading}
                        className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        Request changes instead →
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div className="mt-10 text-center">
          <p className="text-xs text-gray-400">
            Powered by{" "}
            <span className="font-semibold text-gray-500">AutoDocks</span>
            {" "}· AI Content Calendar for Indian Agencies
          </p>
        </div>
      </main>
    </div>
  );
}
