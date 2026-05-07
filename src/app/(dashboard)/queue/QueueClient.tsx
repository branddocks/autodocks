"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Hash,
  Calendar,
  LayoutGrid,
  Image as ImageIcon,
  BookOpen,
  Type,
  Loader2,
  Pencil,
  Save,
  X,
} from "lucide-react";

interface QueuePost {
  id: string;
  clientId: string;
  clientName: string;
  clientColor: string;
  caption: string;
  hashtags: string[];
  postType: string;
  contentPillar: string | null;
  scheduledAt: string | null;
  status: string;
}

const POST_TYPE_LABELS: Record<string, { icon: React.ReactNode; label: string }> = {
  SINGLE_IMAGE: { icon: <ImageIcon className="w-3 h-3" />, label: "Image" },
  CAROUSEL: { icon: <LayoutGrid className="w-3 h-3" />, label: "Carousel" },
  STORY: { icon: <BookOpen className="w-3 h-3" />, label: "Story" },
  TEXT_ONLY: { icon: <Type className="w-3 h-3" />, label: "Text" },
};

export function QueueClient({ initialPosts }: { initialPosts: QueuePost[] }) {
  const [posts, setPosts] = useState<QueuePost[]>(initialPosts);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  // Inline editing state per post
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editHashtags, setEditHashtags] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const clients = [...new Set(posts.map((p) => p.clientName))];

  const filteredPosts =
    filter === "all" ? posts : posts.filter((p) => p.clientName === filter);

  const handleAction = async (postId: string, action: "APPROVED" | "REJECTED") => {
    setActionLoading(postId + action);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveAll = async () => {
    const drafts = filteredPosts.filter((p) => p.status === "DRAFT");
    for (const post of drafts) {
      await handleAction(post.id, "APPROVED");
    }
  };

  const openEdit = (post: QueuePost) => {
    setEditingId(post.id);
    setEditCaption(post.caption);
    setEditHashtags(post.hashtags.join(" "));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCaption("");
    setEditHashtags("");
  };

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
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, caption: editCaption, hashtags } : p
          )
        );
        cancelEdit();
      }
    } finally {
      setSaveLoading(false);
    }
  };

  if (posts.length === 0) {
    return (
      <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-12 text-center">
        <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
        <p className="font-display font-bold text-lg mb-1">All caught up!</p>
        <p className="text-sm text-muted">No more posts waiting for review.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters + bulk actions */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-brand text-white"
                : "bg-surface-warm border border-border-strong hover:border-brand-100"
            }`}
          >
            All ({posts.length})
          </button>
          {clients.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === c
                  ? "bg-brand text-white"
                  : "bg-surface-warm border border-border-strong hover:border-brand-100"
              }`}
            >
              {c} ({posts.filter((p) => p.clientName === c).length})
            </button>
          ))}
        </div>
        {filteredPosts.length > 1 && (
          <button
            onClick={handleApproveAll}
            disabled={!!actionLoading}
            className="flex items-center gap-2 bg-success text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve All ({filteredPosts.length})
          </button>
        )}
      </div>

      {/* Post list */}
      <div className="space-y-3">
        {filteredPosts.map((post) => {
          const typeInfo = POST_TYPE_LABELS[post.postType] ?? { icon: <ImageIcon className="w-3 h-3" />, label: post.postType };
          const initials = post.clientName
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          const isEditing = editingId === post.id;

          return (
            <div
              key={post.id}
              className="bg-surface border border-[var(--color-border)] rounded-2xl p-5 flex gap-4"
            >
              {/* Client avatar */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs flex-shrink-0 self-start mt-0.5"
                style={{ backgroundColor: post.clientColor }}
              >
                {initials}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-semibold text-foreground">
                    {post.clientName}
                  </span>
                  {post.contentPillar && (
                    <span className="text-xs bg-brand-50 border border-brand-100 text-brand px-2 py-0.5 rounded-full">
                      {post.contentPillar}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-muted bg-surface-warm px-2 py-0.5 rounded-full border border-border-strong">
                    {typeInfo.icon}
                    {typeInfo.label}
                  </span>
                  {post.scheduledAt && (
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.scheduledAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  )}
                </div>

                {/* Caption — view or edit */}
                {isEditing ? (
                  <div className="space-y-2 mb-3">
                    <textarea
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      rows={5}
                      className="w-full text-sm leading-relaxed bg-surface-warm rounded-xl p-3 border border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
                    />
                    <input
                      type="text"
                      value={editHashtags}
                      onChange={(e) => setEditHashtags(e.target.value)}
                      placeholder="#tag1 #tag2 #tag3"
                      className="w-full text-sm bg-surface-warm rounded-xl px-3 py-2 border border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/30"
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-foreground leading-relaxed line-clamp-3 mb-3">
                      {post.caption}
                    </p>
                    {post.hashtags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mb-3">
                        <Hash className="w-3 h-3 text-muted-fg flex-shrink-0" />
                        {post.hashtags.slice(0, 5).map((tag, i) => (
                          <span key={i} className="text-xs text-brand font-medium">
                            {tag}
                          </span>
                        ))}
                        {post.hashtags.length > 5 && (
                          <span className="text-xs text-muted-fg">
                            +{post.hashtags.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Actions */}
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={cancelEdit}
                      disabled={saveLoading}
                      className="flex items-center gap-1.5 border border-border-strong text-muted hover:bg-surface-warm px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEdit(post.id)}
                      disabled={saveLoading}
                      className="flex items-center gap-1.5 bg-brand text-white hover:bg-brand-deep px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      {saveLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Save className="w-3 h-3" />
                      )}
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(post)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 border border-border-strong text-muted hover:border-brand-100 hover:text-brand px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleAction(post.id, "REJECTED")}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {actionLoading === post.id + "REJECTED" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(post.id, "APPROVED")}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 bg-success text-white hover:opacity-90 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      {actionLoading === post.id + "APPROVED" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
