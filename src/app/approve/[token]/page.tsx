import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ApprovalClient } from "./ApprovalClient";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const calendar = await prisma.calendar.findUnique({
    where: { id: token },
    select: { month: true, year: true, client: { select: { businessName: true } } },
  });
  if (!calendar) return { title: "Approval Request" };
  return {
    title: `${calendar.client.businessName} — ${MONTHS[calendar.month - 1]} ${calendar.year} Content Approval`,
    description: "Review and approve your social media content calendar.",
  };
}

export default async function ApprovePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const calendar = await prisma.calendar.findUnique({
    where: { id: token },
    select: {
      id: true,
      month: true,
      year: true,
      client: {
        select: {
          businessName: true,
          niche: true,
          brandColors: true,
        },
      },
      posts: {
        orderBy: { scheduledAt: "asc" },
        select: {
          id: true,
          caption: true,
          hashtags: true,
          postType: true,
          contentPillar: true,
          scheduledAt: true,
          status: true,
          imagePrompt: true,
        },
      },
    },
  });

  if (!calendar) notFound();

  const brandColors = (calendar.client.brandColors as string[]) ?? ["#6366f1"];
  const accentColor = brandColors[0] ?? "#6366f1";

  const serialized = {
    id: calendar.id,
    month: calendar.month,
    year: calendar.year,
    monthName: MONTHS[calendar.month - 1],
    clientName: calendar.client.businessName,
    niche: calendar.client.niche,
    accentColor,
    posts: calendar.posts.map((p) => ({
      id: p.id,
      caption: p.caption,
      hashtags: (p.hashtags as string[]) ?? [],
      postType: p.postType,
      contentPillar: p.contentPillar ?? null,
      scheduledAt: p.scheduledAt?.toISOString() ?? null,
      status: p.status,
      imagePrompt: p.imagePrompt ?? null,
    })),
  };

  return <ApprovalClient calendar={serialized} />;
}
