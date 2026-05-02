import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/utils";

// GET — list all clients for the agency
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agency = await prisma.agency.findUnique({
      where: { userId: (session.user as any).id },
      include: {
        clients: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    return NextResponse.json({ clients: agency.clients, plan: agency.plan });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST — create a new client
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agency = await prisma.agency.findUnique({
      where: { userId: (session.user as any).id },
      include: { clients: { where: { isActive: true } } },
    });

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    // Check plan limits
    const limit = PLAN_LIMITS[agency.plan as keyof typeof PLAN_LIMITS].clients;
    if (agency.clients.length >= limit) {
      return NextResponse.json(
        { error: `Plan limit reached. Upgrade to add more clients. (${limit} max)` },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      businessName,
      niche,
      brandColors,
      toneOfVoice,
      targetAudience,
      contentLanguage,
      contentPillars,
      competitors,
      extraContext,
    } = body;

    if (!businessName || !niche || !targetAudience) {
      return NextResponse.json(
        { error: "Business name, niche, and target audience are required" },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        agencyId: agency.id,
        businessName,
        niche,
        brandColors: brandColors || ["#D4764E", "#1A1A1A", "#FFFFFF"],
        toneOfVoice: toneOfVoice || "professional",
        targetAudience,
        contentLanguage: contentLanguage || "hinglish",
        contentPillars: contentPillars || [],
        competitors: competitors || [],
        extraContext: extraContext || null,
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
