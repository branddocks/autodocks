import { ListChecks } from "lucide-react";

export default function QueuePage() {
  return (
    <div className="animate-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl tracking-tight mb-1">Review Queue</h1>
        <p className="text-sm text-muted">Approve, edit, or reject AI-generated content before it posts.</p>
      </div>
      <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-success-bg border border-success/20 flex items-center justify-center mx-auto mb-5">
          <ListChecks className="w-7 h-7 text-success" />
        </div>
        <h2 className="font-display font-bold text-lg mb-2">Nothing to review</h2>
        <p className="text-sm text-muted max-w-sm mx-auto">
          Generate a content calendar for a client — posts will appear here for your approval.
        </p>
      </div>
    </div>
  );
}
