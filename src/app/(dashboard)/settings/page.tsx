import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { SettingsClient } from "./SettingsClient";

async function getAgencySettings(userId: string) {
  return prisma.agency.findUnique({
    where: { userId },
    select: {
      id: true,
      name: true,
      plan: true,
      subStatus: true,
      trialEndsAt: true,
      createdAt: true,
      user: {
        select: { email: true, name: true, image: true },
      },
    },
  });
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const agency = await getAgencySettings(session.user.id);
  if (!agency) redirect("/onboarding");

  const serializedAgency = {
    id: agency.id,
    name: agency.name,
    plan: agency.plan as string,
    subStatus: agency.subStatus as string,
    trialEndsAt: agency.trialEndsAt?.toISOString() ?? null,
    createdAt: agency.createdAt.toISOString(),
    user: {
      email: agency.user.email,
      name: agency.user.name,
      image: agency.user.image,
    },
  };

  return (
    <div className="animate-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-brand" />
          <h1 className="font-display font-bold text-2xl tracking-tight">Settings</h1>
        </div>
        <p className="text-sm text-muted">
          Manage your agency profile and account preferences.
        </p>
      </div>

      <SettingsClient agency={serializedAgency} />
    </div>
  );
}
