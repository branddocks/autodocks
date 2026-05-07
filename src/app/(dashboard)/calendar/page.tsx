import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users } from "lucide-react";
import { GenerateCalendarForm } from "./GenerateCalendarForm";

async function getAgencyClients(userId: string) {
  const agency = await prisma.agency.findUnique({
    where: { userId },
    select: {
      id: true,
      plan: true,
      clients: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          businessName: true,
          niche: true,
          brandColors: true,
          toneOfVoice: true,
          contentLanguage: true,
        },
      },
    },
  });
  return agency;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { client: preselectedClientId } = await searchParams;
  const agency = await getAgencyClients(session.user.id);
  const clients = agency?.clients ?? [];

  if (clients.length === 0) {
    return (
      <div className="animate-in">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl tracking-tight mb-1">
            Content Calendar
          </h1>
          <p className="text-sm text-muted">
            Generate and manage monthly content for your clients.
          </p>
        </div>
        <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-5">
            <Users className="w-7 h-7 text-brand" />
          </div>
          <h2 className="font-display font-bold text-lg mb-2">
            No clients yet
          </h2>
          <p className="text-sm text-muted max-w-sm mx-auto mb-6">
            Add a client first. We need their brand profile to generate
            relevant content.
          </p>
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-brand-deep transition-colors"
          >
            Add Your First Client
          </Link>
        </div>
      </div>
    );
  }

  const clientsForForm = clients.map((c) => ({
    id: c.id,
    businessName: c.businessName,
    niche: c.niche,
    brandColors: (c.brandColors as string[]) ?? ["#D4764E"],
  }));

  return (
    <div className="animate-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl tracking-tight mb-1">
          Content Calendar
        </h1>
        <p className="text-sm text-muted">
          Generate AI-powered monthly content calendars for your clients.
        </p>
      </div>

      <GenerateCalendarForm
        clients={clientsForForm}
        preselectedClientId={preselectedClientId}
      />
    </div>
  );
}
