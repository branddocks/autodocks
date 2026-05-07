import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ListChecks,
  Sparkles,
  Calendar,
} from "lucide-react";
import { QueueClient } from "./QueueClient";

async function getQueuePosts(userId: string) {
  const agency = await prisma.agency.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!agency) return [];

  return prisma.post.findMany({
    where: {
      client: { agencyId: agency.id },
      status: "DRAFT",
    },
    include: {
      client: {
        select: {
          id: true,
          businessName: true,
          brandColors: true,
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export default async function QueuePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const posts = await getQueuePosts(session.user.id);

  if (posts.length === 0) {
    return (
      <div className="animate-in">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl tracking-tight mb-1">
            Review Queue
          </h1>
          <p className="text-sm text-muted">
            Approve, edit, or reject AI-generated content before it posts.
          </p>
        </div>
        <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-success-bg border border-success/20 flex items-center justify-center mx-auto mb-5">
            <ListChecks className="w-7 h-7 text-success" />
          </div>
          <h2 className="font-display font-bold text-lg mb-2">
            Queue is clear
          </h2>
          <p className="text-sm text-muted max-w-sm mx-auto mb-6">
            No posts waiting for review. Generate a content calendar to start
            creating content.
          </p>
          <Link
            href="/calendar"
            className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-brand-deep transition-colors"
          >
            <Sparkles className="w-4 h-4" /> Generate Calendar
          </Link>
        </div>
      </div>
    );
  }

  const serializedPosts = posts.map((p) => ({
    id: p.id,
    clientId: p.clientId,
    clientName: p.client.businessName,
    clientColor: ((p.client.brandColors as string[]) ?? [])[0] ?? "#D4764E",
    caption: p.caption,
    hashtags: p.hashtags as string[],
    postType: p.postType,
    contentPillar: p.contentPillar,
    scheduledAt: p.scheduledAt?.toISOString() ?? null,
    status: p.status,
  }));

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight mb-1">
            Review Queue
          </h1>
          <p className="text-sm text-muted">
            {posts.length} post{posts.length !== 1 ? "s" : ""} waiting for your
            approval
          </p>
        </div>
        <Link
          href="/calendar"
          className="inline-flex items-center gap-2 bg-surface-warm border border-border-strong px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-surface transition-colors"
        >
          <Calendar className="w-4 h-4" /> New Calendar
        </Link>
      </div>

      <QueueClient initialPosts={serializedPosts} />
    </div>
  );
}
