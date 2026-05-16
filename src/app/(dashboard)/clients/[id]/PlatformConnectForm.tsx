"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Unlink, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

// ── Icons ────────────────────────────────────────────────────────────────────

const FbIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const LiIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

// ── Facebook Section ─────────────────────────────────────────────────────────

function FacebookSection({
  clientId,
  initialPageId,
  initialConnected,
}: {
  clientId: string;
  initialPageId: string;
  initialConnected: boolean;
}) {
  const router = useRouter();
  const [connected, setConnected] = useState(initialConnected);
  const [showForm, setShowForm] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [pageId, setPageId] = useState(initialPageId);
  const [pageToken, setPageToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageId.trim() || !pageToken.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fbPageId: pageId.trim(), fbPageToken: pageToken.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Connection failed.");
        return;
      }
      setConnected(true);
      setSuccess("Facebook Page connected!");
      setShowForm(false);
      setPageToken("");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect Facebook? Posts won't be published to this Page.")) return;
    setLoading(true);
    try {
      await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fbPageId: null, fbPageToken: null }),
      });
      setConnected(false);
      setPageId("");
      setPageToken("");
      setSuccess("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-b border-[var(--color-border)] pb-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1877F2] flex items-center justify-center">
            <FbIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">Facebook Page</p>
            <p className="text-xs text-muted-fg">
              {connected ? `Page ID: ${pageId}` : "Not connected"}
            </p>
          </div>
        </div>
        {connected ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-success font-medium bg-success-bg border border-success/20 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Connected
            </span>
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium transition-colors disabled:opacity-50"
            >
              <Unlink className="w-3 h-3" />
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm text-brand font-semibold hover:text-brand-deep transition-colors"
          >
            Connect
          </button>
        )}
      </div>

      {success && !showForm && (
        <p className="text-xs text-success bg-success-bg border border-success/20 rounded-xl px-3 py-2 mb-2">
          {success}
        </p>
      )}

      {showForm && (
        <form onSubmit={handleConnect} className="space-y-3 mt-3">
          {/* Guide */}
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-2 text-xs text-brand font-medium hover:text-brand-deep transition-colors"
          >
            {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            How to get Facebook Page credentials
          </button>

          {showGuide && (
            <div className="bg-surface-warm rounded-xl p-4 border border-border-strong text-xs text-muted space-y-2">
              <p className="font-semibold text-foreground">3-step setup:</p>
              <ol className="space-y-1.5 list-decimal list-inside">
                <li>
                  Go to{" "}
                  <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer"
                    className="text-brand underline inline-flex items-center gap-0.5">
                    Meta Graph API Explorer <ExternalLink className="w-2.5 h-2.5" />
                  </a>{" "}
                  and log in with the account that manages the Facebook Page.
                </li>
                <li>
                  Click <strong>Generate Access Token</strong>. Grant:{" "}
                  <code className="bg-surface px-1 rounded">pages_manage_posts</code>,{" "}
                  <code className="bg-surface px-1 rounded">pages_read_engagement</code>.
                </li>
                <li>
                  Run <code className="bg-surface px-1 rounded">me/accounts</code> — copy the <strong>Page ID</strong> and the <strong>access_token</strong> for that page from the result.
                </li>
              </ol>
              <p className="text-muted-fg pt-1">
                Use the <strong>Page Access Token</strong> (not the User token) — it doesn't expire as long as the page remains connected.
              </p>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
              Facebook Page ID
            </label>
            <input
              type="text"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              placeholder="e.g. 123456789012345"
              className="w-full text-sm bg-surface-warm border border-border-strong rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
              Page Access Token
            </label>
            <textarea
              value={pageToken}
              onChange={(e) => setPageToken(e.target.value)}
              placeholder="Paste page access token…"
              rows={3}
              className="w-full text-sm bg-surface-warm border border-border-strong rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none font-mono text-xs"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={() => { setShowForm(false); setError(""); }}
              className="flex-1 text-sm border border-border-strong rounded-xl py-2.5 text-muted hover:bg-surface-warm transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading || !pageId.trim() || !pageToken.trim()}
              className="flex-1 flex items-center justify-center gap-2 text-sm bg-[#1877F2] text-white rounded-xl py-2.5 font-semibold hover:opacity-90 transition-all disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FbIcon className="w-4 h-4" />}
              {loading ? "Saving…" : "Connect Facebook"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── LinkedIn Section ──────────────────────────────────────────────────────────

function LinkedInSection({
  clientId,
  initialOrgId,
  initialConnected,
}: {
  clientId: string;
  initialOrgId: string;
  initialConnected: boolean;
}) {
  const router = useRouter();
  const [connected, setConnected] = useState(initialConnected);
  const [showForm, setShowForm] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [orgId, setOrgId] = useState(initialOrgId);
  const [liToken, setLiToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId.trim() || !liToken.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedInOrgId: orgId.trim(), linkedInToken: liToken.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Connection failed.");
        return;
      }
      setConnected(true);
      setSuccess("LinkedIn Company Page connected!");
      setShowForm(false);
      setLiToken("");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect LinkedIn? Posts won't be published to this Company Page.")) return;
    setLoading(true);
    try {
      await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedInOrgId: null, linkedInToken: null }),
      });
      setConnected(false);
      setOrgId("");
      setLiToken("");
      setSuccess("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0A66C2] flex items-center justify-center">
            <LiIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">LinkedIn Company Page</p>
            <p className="text-xs text-muted-fg">
              {connected ? `Org ID: ${orgId}` : "Not connected"}
            </p>
          </div>
        </div>
        {connected ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-success font-medium bg-success-bg border border-success/20 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Connected
            </span>
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium transition-colors disabled:opacity-50"
            >
              <Unlink className="w-3 h-3" />
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm text-brand font-semibold hover:text-brand-deep transition-colors"
          >
            Connect
          </button>
        )}
      </div>

      {success && !showForm && (
        <p className="text-xs text-success bg-success-bg border border-success/20 rounded-xl px-3 py-2 mb-2">
          {success}
        </p>
      )}

      {showForm && (
        <form onSubmit={handleConnect} className="space-y-3 mt-3">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-2 text-xs text-brand font-medium hover:text-brand-deep transition-colors"
          >
            {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            How to get LinkedIn Company Page credentials
          </button>

          {showGuide && (
            <div className="bg-surface-warm rounded-xl p-4 border border-border-strong text-xs text-muted space-y-2">
              <p className="font-semibold text-foreground">Setup:</p>
              <ol className="space-y-1.5 list-decimal list-inside">
                <li>
                  Create a LinkedIn app at{" "}
                  <a href="https://www.linkedin.com/developers/apps" target="_blank" rel="noopener noreferrer"
                    className="text-brand underline inline-flex items-center gap-0.5">
                    linkedin.com/developers/apps <ExternalLink className="w-2.5 h-2.5" />
                  </a>{" "}
                  and associate it with the Company Page.
                </li>
                <li>
                  Request the <code className="bg-surface px-1 rounded">w_member_social</code> and{" "}
                  <code className="bg-surface px-1 rounded">r_organization_social</code> products. Generate an OAuth 2.0 access token.
                </li>
                <li>
                  Find your Company Page Organization ID by calling{" "}
                  <code className="bg-surface px-1 rounded">GET /v2/organizationalEntityAcls?q=roleAssignee</code> — the numeric ID in the URN is your Org ID (e.g. <code className="bg-surface px-1 rounded">12345678</code>).
                </li>
              </ol>
              <p className="text-muted-fg pt-1">
                LinkedIn access tokens expire in <strong>60 days</strong>. You'll need to refresh and re-paste after expiry.
              </p>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
              Organization ID
            </label>
            <input
              type="text"
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              placeholder="e.g. 12345678"
              className="w-full text-sm bg-surface-warm border border-border-strong rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              required
            />
            <p className="text-xs text-muted-fg mt-1">The numeric ID only — not the full URN.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
              Access Token
            </label>
            <textarea
              value={liToken}
              onChange={(e) => setLiToken(e.target.value)}
              placeholder="Paste OAuth 2.0 access token…"
              rows={3}
              className="w-full text-sm bg-surface-warm border border-border-strong rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none font-mono text-xs"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={() => { setShowForm(false); setError(""); }}
              className="flex-1 text-sm border border-border-strong rounded-xl py-2.5 text-muted hover:bg-surface-warm transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading || !orgId.trim() || !liToken.trim()}
              className="flex-1 flex items-center justify-center gap-2 text-sm bg-[#0A66C2] text-white rounded-xl py-2.5 font-semibold hover:opacity-90 transition-all disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LiIcon className="w-4 h-4" />}
              {loading ? "Saving…" : "Connect LinkedIn"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface Props {
  clientId: string;
  fbPageId: string;
  fbConnected: boolean;
  linkedInOrgId: string;
  linkedInConnected: boolean;
}

export function PlatformConnectForm({
  clientId,
  fbPageId,
  fbConnected,
  linkedInOrgId,
  linkedInConnected,
}: Props) {
  return (
    <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-5 mb-6">
      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-5">
        Connected Platforms
      </h3>
      <FacebookSection
        clientId={clientId}
        initialPageId={fbPageId}
        initialConnected={fbConnected}
      />
      <LinkedInSection
        clientId={clientId}
        initialOrgId={linkedInOrgId}
        initialConnected={linkedInConnected}
      />
    </div>
  );
}
