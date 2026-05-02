import { Calendar, Sparkles } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="animate-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl tracking-tight mb-1">Content Calendar</h1>
        <p className="text-sm text-muted">Generate and manage monthly content for your clients.</p>
      </div>
      <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-5">
          <Calendar className="w-7 h-7 text-brand" />
        </div>
        <h2 className="font-display font-bold text-lg mb-2">Add a client first</h2>
        <p className="text-sm text-muted max-w-sm mx-auto mb-6">
          Once you've added a client, you can generate AI-powered content calendars here.
        </p>
      </div>
    </div>
  );
}
