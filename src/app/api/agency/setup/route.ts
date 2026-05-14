import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { agencyName } = await req.json();

    if (!agencyName?.trim()) {
      return NextResponse.json(
        { error: "Agency name is required" },
        { status: 400 }
      );
    }

    // Check if agency already exists
    const existing = await prisma.agency.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Agency already exists", agency: existing },
        { status: 200 }
      );
    }

    // Create agency for this user (Google OAuth signup path)
    const agency = await prisma.agency.create({
      data: {
        userId: session.user.id,
        name: agencyName.trim(),
        plan: "STARTER",
        subStatus: "TRIAL",
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Fire welcome email for Google OAuth signups
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true },
    });
    if (user?.email) {
      sendWelcomeEmail({ to: user.email, name: user.name ?? "there" }).catch(() => {});
    }

    return NextResponse.json(
      { message: "Agency created", agency },
      { status: 201 }
    );
  } catch (error) {
    console.error("Agency setup error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
