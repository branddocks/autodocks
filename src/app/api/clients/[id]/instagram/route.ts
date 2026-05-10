import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const IG_API = "https://graph.facebook.com/v19.0";

/**
 * PATCH /api/clients/[id]/instagram
 * Save or update Instagram credentials for a client.
 * Validates the token by fetching the IG account name.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: clientId } = await params;

    // Verify ownership
    const client = await prisma.client.findFirst({
      where: { id: clientId, agency: { userId: session.user.id } },
      select: { id: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const { igUserId, igAccessToken } = await req.json() as {
      igUserId: string;
      igAccessToken: string;
    };

    if (!igUserId?.trim() || !igAccessToken?.trim()) {
      return NextResponse.json(
        { error: "Both Instagram Business Account ID and Access Token are required" },
        { status: 400 }
      );
    }

    // Validate credentials against Meta API
    const validateRes = await fetch(
      `${IG_API}/${igUserId.trim()}?fields=id,username,name&access_token=${igAccessToken.trim()}`
    );

    if (!validateRes.ok) {
      const err = await validateRes.json();
      const msg = err?.error?.message ?? "Invalid credentials";
      return NextResponse.json(
        { error: `Instagram validation failed: ${msg}` },
        { status: 400 }
      );
    }

    const igData = await validateRes.json() as { id: string; username?: string; name?: string };

    // Save to DB
    const updated = await prisma.client.update({
      where: { id: clientId },
      data: {
        igUserId: igData.id,
        igUsername: igData.username ?? igData.name ?? null,
        igAccessToken: igAccessToken.trim(),
      },
      select: { id: true, igUserId: true, igUsername: true },
    });

    return NextResponse.json({
      success: true,
      igUserId: updated.igUserId,
      igUsername: updated.igUsername,
    });
  } catch (error) {
    console.error("PATCH /api/clients/[id]/instagram error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/clients/[id]/instagram
 * Disconnect Instagram from a client.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: clientId } = await params;

    const client = await prisma.client.findFirst({
      where: { id: clientId, agency: { userId: session.user.id } },
      select: { id: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    await prisma.client.update({
      where: { id: clientId },
      data: {
        igUserId: null,
        igUsername: null,
        igAccessToken: null,
        igTokenExpiry: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/clients/[id]/instagram error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
