import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Settings, AlertTriangle } from "lucide-react";
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

function isExpired(trialEndsAt: Date | null, subStatus: string): boolean {
  if (subStatus !== "TRIAL") return false;
  if (!trialEndsAt) return false;
  return trialEndsAt < new Date();
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const agency = await getAgencySettings(session.user.id);
  if (!agency) redirect("/onboarding");

  const params = await searchParams;
  const showExpiredBanner = params.expired === "1" || isExpired(agency.trialEndsAt, agency.subStatus as string);

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
      {showExpiredBanner && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700 mb-1">Your free trial has ended</p>
            <p className="text-sm text-red-600">
              Choose a plan below to continue using AutoDocks. Your data is safe — nothing is deleted.
            </p>
          </div>
        </div>
      )}

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
