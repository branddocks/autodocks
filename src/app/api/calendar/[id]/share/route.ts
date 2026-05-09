import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET  /api/calendar/[id]/share  — returns the share URL for this calendar
// POST /api/calendar/[id]/share  — same (idempotent, calendarId IS the token)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleShare(await params);
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleShare(await params);
}

async function handleShare({ id }: { id: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify calendar belongs to this agency
  const calendar = await prisma.calendar.findFirst({
    where: {
      id,
      client: { agency: { userId: session.user.id } },
    },
    select: {
      id: true,
      month: true,
      year: true,
      client: { select: { businessName: true } },
    },
  });

  if (!calendar) {
    return NextResponse.json({ error: "Calendar not found" }, { status: 404 });
  }

  // The calendarId itself is the share token (cuid = 25-char unguessable string)
  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://auto.branddocks.com";
  const shareUrl = `${baseUrl}/approve/${calendar.id}`;

  return NextResponse.json({
    shareUrl,
    calendarId: calendar.id,
    clientName: calendar.client.businessName,
    month: calendar.month,
    year: calendar.year,
  });
}
