import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

// PATCH /api/admin/agencies/[id]
// Updates plan, subStatus, trialEndsAt, adminNote for any agency
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email || !isAdmin(token.email as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { plan, subStatus, trialEndsAt, adminNote } = body;

  const data: Record<string, unknown> = {};
  if (plan !== undefined) data.plan = plan;
  if (subStatus !== undefined) data.subStatus = subStatus;
  if (trialEndsAt !== undefined) data.trialEndsAt = trialEndsAt ? new Date(trialEndsAt) : null;
  if (adminNote !== undefined) data.adminNote = adminNote;

  try {
    const agency = await prisma.agency.update({
      where: { id },
      data,
      include: {
        user: { select: { email: true, name: true } },
        _count: { select: { clients: true } },
      },
    });
    return NextResponse.json({ agency });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET /api/admin/agencies/[id]
// Full agency detail for admin
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email || !isAdmin(token.email as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const agency = await prisma.agency.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, name: true, createdAt: true } },
      clients: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          businessName: true,
          niche: true,
          isActive: true,
          igUsername: true,
          createdAt: true,
          _count: { select: { posts: true, calendars: true } },
        },
      },
      _count: { select: { clients: true } },
    },
  });

  if (!agency) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ agency });
}
