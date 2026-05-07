import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/agency/settings — return agency profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        plan: true,
        subStatus: true,
        trialEndsAt: true,
        createdAt: true,
        user: { select: { email: true, name: true, image: true } },
      },
    });

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    return NextResponse.json({ agency });
  } catch (error) {
    console.error("GET /api/agency/settings error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/agency/settings — update agency name
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Agency name is required" }, { status: 400 });
    }

    if (name.trim().length > 80) {
      return NextResponse.json({ error: "Agency name must be 80 characters or less" }, { status: 400 });
    }

    const agency = await prisma.agency.update({
      where: { userId: session.user.id },
      data: { name: name.trim() },
      select: { id: true, name: true, plan: true, subStatus: true },
    });

    return NextResponse.json({ agency });
  } catch (error) {
    console.error("PATCH /api/agency/settings error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
