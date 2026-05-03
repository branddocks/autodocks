import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper: verify client belongs to the current user's agency
async function getClientForUser(clientId: string, userId: string) {
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      agency: { userId },
      isActive: true,
    },
    include: {
      _count: {
        select: {
          posts: true,
          calendars: true,
        },
      },
    },
  });
  return client;
}

// GET /api/clients/[id] — fetch single client
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const client = await getClientForUser(id, session.user.id);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error("GET /api/clients/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/clients/[id] — update brand profile
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getClientForUser(id, session.user.id);

    if (!existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const body = await req.json();

    // Only allow updating these fields
    const allowed = [
      "businessName",
      "niche",
      "brandColors",
      "toneOfVoice",
      "targetAudience",
      "contentLanguage",
      "contentPillars",
      "competitors",
      "extraContext",
      "logoUrl",
      "isActive",
    ];

    const updateData: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updateData[key] = body[key];
    }

    const updated = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ client: updated });
  } catch (error) {
    console.error("PATCH /api/clients/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/clients/[id] — soft delete
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getClientForUser(id, session.user.id);

    if (!existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Soft delete — keeps all posts/calendar data intact
    await prisma.client.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Client removed" });
  } catch (error) {
    console.error("DELETE /api/clients/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
