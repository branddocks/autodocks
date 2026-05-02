import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const maxClients = agency.plan === "PRO" ? 10 : 3;
    if (agency.clients.length >= maxClients) {
      return NextResponse.json(
        { error: "Plan limit reached. Upgrade to add more clients." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const client = await prisma.client.create({
      data: {
        agencyId: agency.id,
        businessName: body.businessName,
        niche: body.niche,
        brandColors: body.brandColors || ["#D4764E", "#1A1A1A", "#FFFFFF"],
        toneOfVoice: body.toneOfVoice || "professional",
        targetAudience: body.targetAudience,
        contentLanguage: body.contentLanguage || "hinglish",
        contentPillars: body.contentPillars || [],
        competitors: body.competitors || [],
        extraContext: body.extraContext || null,
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
