import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/approve/[token] — fetch calendar + posts for the approval page
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
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

  if (!calendar) {
    return NextResponse.json({ error: "Approval link not found" }, { status: 404 });
  }

  return NextResponse.json({ calendar });
}

// POST /api/approve/[token] — client approves or rejects a post
// Body: { postId: string, action: "APPROVED" | "REJECTED", feedback?: string }
export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // Validate the calendar exists and the postId belongs to it
  const body = await req.json();
  const { postId, action, feedback } = body as {
    postId: string;
    action: "APPROVED" | "REJECTED";
    feedback?: string;
  };

  if (!postId || !["APPROVED", "REJECTED"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Verify post belongs to this calendar (token = calendarId)
  const post = await prisma.post.findFirst({
    where: { id: postId, calendarId: token },
    select: { id: true, status: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Update post status
  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      status: action,
      // Store feedback in failureReason field (re-purposed for client notes)
      ...(feedback ? { failureReason: feedback } : {}),
    },
    select: { id: true, status: true },
  });

  return NextResponse.json({ post: updated });
}
