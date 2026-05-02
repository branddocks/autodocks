import Link from "next/link";
import { Plus, Users, Sparkles, ArrowRight } from "lucide-react";

export default function ClientsPage() {
  // TODO: Fetch clients from API
  const clients: any[] = [];

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight mb-1">Clients</h1>
          <p className="text-sm text-muted">Manage your client brand profiles.</p>
        </div>
        <Link href="/clients/new"
          className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-brand-deep transition-colors">
          <Plus className="w-4 h-4" /> Add Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-5">
            <Users className="w-7 h-7 text-brand" />
          </div>
          <h2 className="font-display font-bold text-lg mb-2">No clients yet</h2>
          <p className="text-sm text-muted max-w-sm mx-auto mb-6">
            Add your first client's brand profile. AI will use it to generate perfectly branded content.
          </p>
          <Link href="/clients/new"
            className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-brand-deep transition-colors">
            <Sparkles className="w-4 h-4" /> Add Your First Client
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client: any) => (
            <Link key={client.id} href={`/clients/${client.id}`}
              className="bg-surface border border-[var(--color-border)] rounded-2xl p-6 hover:border-brand-100 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-white text-sm"
                  style={{ backgroundColor: client.brandColors?.[0] || "#D4764E" }}>
                  {client.businessName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">{client.businessName}</h3>
                  <p className="text-xs text-muted">{client.niche}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                {client.brandColors?.map((c: string, i: number) => (
                  <div key={i} className="w-5 h-5 rounded-md border border-border-strong" style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">{client.contentLanguage} · {client.toneOfVoice}</span>
                <ArrowRight className="w-4 h-4 text-muted group-hover:text-brand transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
