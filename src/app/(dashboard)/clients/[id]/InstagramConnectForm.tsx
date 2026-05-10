"use client";

import { useState } from "react";
import { Instagram, CheckCircle2, Loader2, Unlink, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  clientId: string;
  igUserId: string;
  igUsername: string;
  isConnected: boolean;
}

export function InstagramConnectForm({ clientId, igUserId, igUsername, isConnected }: Props) {
  const [connected, setConnected] = useState(isConnected);
  const [username, setUsername] = useState(igUsername);
  const [showForm, setShowForm] = useState(false);

  const [igUserIdInput, setIgUserIdInput] = useState(igUserId);
  const [igToken, setIgToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showGuide, setShowGuide] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!igUserIdInput.trim() || !igToken.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/clients/${clientId}/instagram`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ igUserId: igUserIdInput.trim(), igAccessToken: igToken.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Connection failed. Check your credentials.");
        return;
      }
      setConnected(true);
      setUsername(data.igUsername ?? igUserIdInput.trim());
      setSuccess("Instagram connected successfully!");
      setShowForm(false);
      setIgToken("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect Instagram? You won't be able to publish posts until you reconnect.")) return;
    setLoading(true);
    try {
      await fetch(`/api/clients/${clientId}/instagram`, { method: "DELETE" });
      setConnected(false);
      setUsername("");
      setIgUserIdInput("");
      setIgToken("");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 via-[#E1306C] to-orange-400 flex items-center justify-center">
            <Instagram className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Instagram Publishing</h3>
            <p className="text-xs text-muted-fg">
              {connected ? `Connected · @${username}` : "Not connected"}
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
            className="text-sm text-brand font-semibold hover:text-brand-deep transition-colors flex items-center gap-1"
          >
            Connect
          </button>
        )}
      </div>

      {success && !showForm && (
        <p className="text-xs text-success bg-success-bg border border-success/20 rounded-xl px-3 py-2 mb-3">
          {success}
        </p>
      )}

      {showForm && (
        <form onSubmit={handleConnect} className="space-y-3">
          {/* How to get credentials guide */}
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-2 text-xs text-brand font-medium hover:text-brand-deep transition-colors w-full text-left"
          >
            {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            How to get your Instagram credentials
          </button>

          {showGuide && (
            <div className="bg-surface-warm rounded-xl p-4 border border-border-strong text-xs text-muted space-y-2">
              <p className="font-semibold text-foreground">3-step setup:</p>
              <ol className="space-y-1.5 list-decimal list-inside">
                <li>
                  Go to{" "}
                  <a
                    href="https://developers.facebook.com/tools/explorer/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand underline inline-flex items-center gap-0.5"
                  >
                    Meta Graph API Explorer
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>{" "}
                  and log in with the Facebook account connected to this Instagram Business account.
                </li>
                <li>
                  Click <strong>Generate Access Token</strong>. Grant permissions:{" "}
                  <code className="bg-surface px-1 rounded">instagram_basic</code>,{" "}
                  <code className="bg-surface px-1 rounded">instagram_content_publish</code>,{" "}
                  <code className="bg-surface px-1 rounded">pages_read_engagement</code>.
                </li>
                <li>
                  In the query field, type{" "}
                  <code className="bg-surface px-1 rounded">me/accounts</code> and hit Submit. Copy the{" "}
                  <strong>Instagram Business Account ID</strong> from the result (it&apos;s under the Page linked to Instagram).
                </li>
              </ol>
              <p className="text-muted-fg pt-1">
                Note: Instagram must be a <strong>Business</strong> or <strong>Creator</strong> account linked to a Facebook Page.
              </p>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
              Instagram Business Account ID
            </label>
            <input
              type="text"
              value={igUserIdInput}
              onChange={(e) => setIgUserIdInput(e.target.value)}
              placeholder="e.g. 17841400008460056"
              className="w-full text-sm bg-surface-warm border border-border-strong rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
              Access Token
            </label>
            <textarea
              value={igToken}
              onChange={(e) => setIgToken(e.target.value)}
              placeholder="Paste your access token here..."
              rows={3}
              className="w-full text-sm bg-surface-warm border border-border-strong rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none font-mono text-xs"
              required
            />
            <p className="text-xs text-muted-fg mt-1">
              For production, use a long-lived token (valid 60 days). Short-lived tokens expire in 1 hour.
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(""); }}
              className="flex-1 text-sm border border-border-strong rounded-xl py-2.5 text-muted hover:bg-surface-warm transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !igUserIdInput.trim() || !igToken.trim()}
              className="flex-1 flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-purple-500 to-[#E1306C] text-white rounded-xl py-2.5 font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Instagram className="w-4 h-4" />
              )}
              {loading ? "Validating…" : "Connect Instagram"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
