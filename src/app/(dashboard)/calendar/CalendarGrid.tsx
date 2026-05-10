"use client";

import { useState } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Image as ImageIcon,
  Hash,
  Type,
  LayoutGrid,
  BookOpen,
  Pencil,
  Save,
  Loader2,
  Send,
  Link as LinkIcon,
  Instagram,
} from "lucide-react";

export interface GeneratedPostData {
  id: string;
  date: string | null;
  day: string | null;
  postType: string;
  contentPillar: string | null;
  topic: string | null;
  caption: string;
  hashtags: string[] | null;
  bestTime: string | null;
  imageDirection: string | null;
  imageUrl?: string | null;
  scheduledAt: string | null;
  status: string;
}

// Pillar color palette — cycles through these
const PILLAR_COLORS = [
  "bg-brand text-white",
  "bg-info text-white",
  "bg-success text-white",
  "bg-warning text-foreground",
  "bg-purple-500 text-white",
  "bg-pink-500 text-white",
];

const POST_TYPE_ICON: Record<string, React.ReactNode> = {
  SINGLE_IMAGE: <ImageIcon className="w-3 h-3" />,
  CAROUSEL: <LayoutGrid className="w-3 h-3" />,
  STORY: <BookOpen className="w-3 h-3" />,
  TEXT_ONLY: <Type className="w-3 h-3" />,
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-surface-warm border-border-strong text-muted",
  APPROVED: "bg-success-bg border-success/20 text-success",
  REJECTED: "bg-red-50 border-red-200 text-red-600",
  SCHEDULED: "bg-info-bg border-info/20 text-info",
  POSTED: "bg-brand-50 border-brand-100 text-brand",
};

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function buildMonthGrid(year: number, month: number) {
  // month is 1-indexed
  const firstDay = new Date(year, month - 1, 1);
  // Convert Sunday=0 to Mon=0
  const firstDow = (firstDay.getDay() + 6) % 7; // Mon=0…Sun=6
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

export function CalendarGrid({
  posts,
  month,
  year,
  calendarId,
  clientName,
  clientId,
}: {
  posts: GeneratedPostData[];
  month: number;
  year: number;
  calendarId?: string;
  clientName?: string;
  clientId?: string;
}) {
  const [selectedPost, setSelectedPost] = useState<GeneratedPostData | null>(null);
  const [postStatuses, setPostStatuses] = useState<Record<string, string>>(
    Object.fromEntries(posts.map((p) => [p.id, p.status]))
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Inline editing state
  const [editMode, setEditMode] = useState(false);
  const [editCaption, setEditCaption] = useState("");
  const [editHashtags, setEditHashtags] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [savedData, setSavedData] = useState<Record<string, { caption: string; hashtags: string[] }>>({});

  // Image URL state
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageInputVal, setImageInputVal] = useState("");
  const [imageSaving, setImageSaving] = useState(false);

  // Publish state
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [postedIds, setPostedIds] = useState<Record<string, boolean>>({});

  const cells = buildMonthGrid(year, month);

  // Build a map: day number → posts
  const postsByDay: Record<number, GeneratedPostData[]> = {};
  for (const post of posts) {
    if (!post.date) continue;
    const d = new Date(post.date);
    const day = d.getDate();
    if (!postsByDay[day]) postsByDay[day] = [];
    postsByDay[day].push(post);
  }

  // Unique pillars for color assignment
  const allPillars = [...new Set(posts.map((p) => p.contentPillar).filter(Boolean))] as string[];
  const pillarColorMap: Record<string, string> = {};
  allPillars.forEach((p, i) => {
    pillarColorMap[p] = PILLAR_COLORS[i % PILLAR_COLORS.length];
  });

  const handleAction = async (postId: string, action: "APPROVED" | "REJECTED") => {
    setActionLoading(postId + action);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) {
        setPostStatuses((prev) => ({ ...prev, [postId]: action }));
        if (selectedPost?.id === postId) {
          setSelectedPost((p) => p ? { ...p, status: action } : null);
        }
      }
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = (post: GeneratedPostData) => {
    const current = savedData[post.id];
    setEditCaption(current?.caption ?? post.caption);
    setEditHashtags((current?.hashtags ?? (post.hashtags as string[]) ?? []).join(" "));
    setEditMode(true);
  };

  const cancelEdit = () => setEditMode(false);

  const saveEdit = async (postId: string) => {
    setSaveLoading(true);
    try {
      const hashtags = editHashtags
        .split(/[\s,]+/)
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean)
        .map((t) => `#${t}`);
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: editCaption, hashtags }),
      });
      if (res.ok) {
        setSavedData((prev) => ({ ...prev, [postId]: { caption: editCaption, hashtags } }));
        setEditMode(false);
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const saveImageUrl = async (postId: string) => {
    setImageSaving(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imageInputVal.trim() || null }),
      });
      if (res.ok) {
        setImageUrls((prev) => ({ ...prev, [postId]: imageInputVal.trim() }));
        setShowImageInput(false);
        setImageInputVal("");
      }
    } finally {
      setImageSaving(false);
    }
  };

  const handlePublish = async (postId: string) => {
    setPublishLoading(true);
    setPublishError("");
    try {
      const res = await fetch(`/api/posts/${postId}/publish`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.error ?? "Publish failed. Try again.");
        return;
      }
      setPostedIds((prev) => ({ ...prev, [postId]: true }));
      setPostStatuses((prev) => ({ ...prev, [postId]: "POSTED" }));
      if (selectedPost?.id === postId) {
        setSelectedPost((p) => p ? { ...p, status: "POSTED" } : null);
      }
    } finally {
      setPublishLoading(false);
    }
  };

  return (
    <div>
      {/* Legend */}
      {allPillars.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {allPillars.map((pillar) => (
            <span
              key={pillar}
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${pillarColorMap[pillar]}`}
            >
              {pillar}
            </span>
          ))}
          <span className="text-xs text-muted-fg self-center ml-1">
            · {posts.length} posts
          </span>
        </div>
      )}

      {/* Month grid */}
      <div className="bg-surface border border-[var(--color-border)] rounded-2xl overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-7 border-b border-[var(--color-border)]">
          {DAYS_SHORT.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-semibold text-muted uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Week rows */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            const dayPosts = day ? (postsByDay[day] ?? []) : [];
            const isToday =
              day !== null &&
              new Date().getDate() === day &&
              new Date().getMonth() + 1 === month &&
              new Date().getFullYear() === year;

            return (
              <div
                key={idx}
                className={`min-h-[90px] border-b border-r border-[var(--color-border)] p-1.5 ${
                  day === null ? "bg-surface-warm" : ""
                } ${idx % 7 === 6 ? "border-r-0" : ""} ${
                  Math.floor(idx / 7) === Math.floor((cells.length - 1) / 7)
                    ? "border-b-0"
                    : ""
                }`}
              >
                {day !== null && (
                  <>
                    <div
                      className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? "bg-brand text-white"
                          : "text-muted"
                      }`}
                    >
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayPosts.map((post) => {
                        const pillarColor = post.contentPillar
                          ? pillarColorMap[post.contentPillar] ?? "bg-surface-warm text-muted"
                          : "bg-surface-warm text-muted";
                        const status = postStatuses[post.id] ?? post.status;
                        const isApproved = status === "APPROVED";
                        const isRejected = status === "REJECTED";

                        return (
                          <button
                            key={post.id}
                            onClick={() => { setSelectedPost(post); setEditMode(false); }}
                            className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate transition-all hover:opacity-80 border ${
                              isApproved
                                ? "bg-success-bg border-success/20 text-success"
                                : isRejected
                                ? "bg-red-50 border-red-200 text-red-500 line-through opacity-60"
                                : `${pillarColor} border-transparent`
                            }`}
                          >
                            {isApproved && "✓ "}
                            {post.contentPillar ?? post.postType}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats bar */}
      <div className="mt-4 flex items-center gap-6 text-xs text-muted-fg">
        <span>
          <span className="font-semibold text-success">
            {Object.values(postStatuses).filter((s) => s === "APPROVED").length}
          </span>{" "}
          approved
        </span>
        <span>
          <span className="font-semibold text-muted">
            {Object.values(postStatuses).filter((s) => s === "DRAFT").length}
          </span>{" "}
          pending review
        </span>
        <span>
          <span className="font-semibold text-red-500">
            {Object.values(postStatuses).filter((s) => s === "REJECTED").length}
          </span>{" "}
          rejected
        </span>
      </div>

      {/* Post modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => { setSelectedPost(null); setEditMode(false); }}
        >
          <div
            className="bg-[var(--color-surface)] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl border border-[var(--color-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between p-5 border-b border-[var(--color-border)]">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedPost.contentPillar && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        pillarColorMap[selectedPost.contentPillar] ??
                        "bg-surface-warm text-muted"
                      }`}
                    >
                      {selectedPost.contentPillar}
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                      STATUS_STYLES[postStatuses[selectedPost.id] ?? selectedPost.status] ??
                      STATUS_STYLES.DRAFT
                    }`}
                  >
                    {postStatuses[selectedPost.id] ?? selectedPost.status}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted bg-surface-warm px-2 py-0.5 rounded-full border border-border-strong">
                    {POST_TYPE_ICON[selectedPost.postType]}
                    {selectedPost.postType.replace("_", " ").toLowerCase()}
                  </span>
                </div>
                <p className="text-sm font-medium mt-2">
                  {selectedPost.day && selectedPost.date
                    ? `${selectedPost.day}, ${new Date(selectedPost.date).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "long" }
                      )}`
                    : selectedPost.date ?? "Date TBD"}
                </p>
              </div>
              <button
                onClick={() => { setSelectedPost(null); setEditMode(false); }}
                className="text-muted hover:text-foreground transition-colors ml-3 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Topic */}
              {selectedPost.topic && (
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                    Topic
                  </p>
                  <p className="text-sm">{selectedPost.topic}</p>
                </div>
              )}

              {/* Caption */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Caption
                  </p>
                  {!editMode && (
                    <button
                      onClick={() => openEdit(selectedPost)}
                      className="flex items-center gap-1 text-xs text-brand hover:text-brand-deep font-medium transition-colors"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  )}
                </div>
                {editMode ? (
                  <textarea
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    rows={6}
                    className="w-full text-sm leading-relaxed bg-surface-warm rounded-xl p-3 border border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
                  />
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap bg-surface-warm rounded-xl p-3 border border-border-strong">
                    {savedData[selectedPost.id]?.caption ?? selectedPost.caption}
                  </p>
                )}
              </div>

              {/* Hashtags */}
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Hash className="w-3 h-3" /> Hashtags
                </p>
                {editMode ? (
                  <input
                    type="text"
                    value={editHashtags}
                    onChange={(e) => setEditHashtags(e.target.value)}
                    placeholder="#tag1 #tag2 #tag3"
                    className="w-full text-sm bg-surface-warm rounded-xl px-3 py-2.5 border border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {((savedData[selectedPost.id]?.hashtags ?? selectedPost.hashtags) as string[] ?? []).map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs bg-brand-50 border border-brand-100 text-brand px-2 py-0.5 rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Image direction */}
              {selectedPost.imageDirection && (
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> Image Direction
                  </p>
                  <p className="text-sm text-muted italic bg-surface-warm rounded-xl p-3 border border-border-strong">
                    {selectedPost.imageDirection}
                  </p>
                </div>
              )}

              {/* Best time */}
              {selectedPost.bestTime && (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Clock className="w-3.5 h-3.5" />
                  Best time to post: <span className="font-medium text-foreground">{selectedPost.bestTime}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            {editMode ? (
              <div className="flex gap-3 p-5 pt-0">
                <button
                  onClick={cancelEdit}
                  disabled={saveLoading}
                  className="flex-1 flex items-center justify-center gap-2 border border-border-strong text-muted hover:bg-surface-warm px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={() => saveEdit(selectedPost.id)}
                  disabled={saveLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand text-white hover:bg-brand-deep px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {saveLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            ) : (
              <>
                {(postStatuses[selectedPost.id] ?? selectedPost.status) === "DRAFT" && (
                  <div className="flex gap-3 p-5 pt-0">
                    <button
                      onClick={() => handleAction(selectedPost.id, "REJECTED")}
                      disabled={!!actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(selectedPost.id, "APPROVED")}
                      disabled={!!actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-success text-white hover:opacity-90 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve
                    </button>
                  </div>
                )}

                {(postStatuses[selectedPost.id] ?? selectedPost.status) === "APPROVED" && (
                  <div className="px-5 pb-5 space-y-3">
                    {/* Image URL section */}
                    {!showImageInput ? (
                      <div className="flex items-center justify-between text-sm bg-surface-warm rounded-xl px-3 py-2.5 border border-border-strong">
                        {imageUrls[selectedPost.id] || selectedPost.imageUrl ? (
                          <span className="text-success font-medium flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" />
                            Image attached
                          </span>
                        ) : (
                          <span className="text-muted flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" />
                            No image — required for publishing
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setImageInputVal(imageUrls[selectedPost.id] || selectedPost.imageUrl || "");
                            setShowImageInput(true);
                          }}
                          className="text-xs text-brand hover:text-brand-deep font-medium flex items-center gap-1"
                        >
                          <LinkIcon className="w-3 h-3" />
                          {imageUrls[selectedPost.id] || selectedPost.imageUrl ? "Change" : "Add Image URL"}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="url"
                          value={imageInputVal}
                          onChange={(e) => setImageInputVal(e.target.value)}
                          placeholder="https://your-image-url.com/image.jpg"
                          className="w-full text-sm bg-surface-warm rounded-xl px-3 py-2.5 border border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/30"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setShowImageInput(false); setImageInputVal(""); }}
                            className="flex-1 text-sm border border-border-strong rounded-xl py-2 text-muted hover:bg-surface-warm transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveImageUrl(selectedPost.id)}
                            disabled={imageSaving}
                            className="flex-1 text-sm bg-brand text-white rounded-xl py-2 font-semibold hover:bg-brand-deep transition-colors disabled:opacity-50"
                          >
                            {imageSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : "Save"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Publish error */}
                    {publishError && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                        {publishError}
                      </p>
                    )}

                    {/* Publish button */}
                    {!postedIds[selectedPost.id] ? (
                      <button
                        onClick={() => handlePublish(selectedPost.id)}
                        disabled={publishLoading || !(imageUrls[selectedPost.id] || selectedPost.imageUrl)}
                        className="w-full flex items-center justify-center gap-2 bg-[#E1306C] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {publishLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Instagram className="w-4 h-4" />
                        )}
                        {publishLoading ? "Publishing…" : "Publish to Instagram"}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-success text-sm font-medium bg-success-bg border border-success/20 px-4 py-2.5 rounded-xl">
                        <CheckCircle2 className="w-4 h-4" />
                        Published to Instagram!
                      </div>
                    )}
                    <p className="text-xs text-muted text-center">
                      Connect Instagram in{" "}
                      <a href={clientId ? `/clients/${clientId}` : "/clients"} className="text-brand underline">
                        client settings
                      </a>{" "}
                      to enable publishing
                    </p>
                  </div>
                )}

                {(postStatuses[selectedPost.id] ?? selectedPost.status) === "POSTED" && (
                  <div className="px-5 pb-5">
                    <div className="flex items-center gap-2 text-brand text-sm font-medium bg-brand-50 border border-brand-100 px-4 py-2.5 rounded-xl">
                      <Send className="w-4 h-4" />
                      Posted to Instagram
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
