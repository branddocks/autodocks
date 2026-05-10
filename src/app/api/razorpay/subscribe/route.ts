import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSubscription, getRazorpayPublicKey } from "@/lib/razorpay";

/**
 * POST /api/razorpay/subscribe
 * Body: { plan: "STARTER" | "PRO" }
 *
 * Creates a Razorpay subscription and returns:
 *   { subscriptionId, keyId }
 *
 * The client uses these to open the Razorpay checkout modal.
 * After payment, Razorpay fires a webhook to /api/webhooks/razorpay
 * which updates the agency's plan and subStatus in the DB.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as { plan?: string };
    const plan = body.plan as "STARTER" | "PRO" | undefined;

    if (!plan || !["STARTER", "PRO"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan. Must be STARTER or PRO." }, { status: 400 });
    }

    // Load agency
    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        plan: true,
        subStatus: true,
        razorpaySubId: true,
        user: { select: { email: true, name: true } },
      },
    });

    if (!agency) {
      return NextResponse.json({ error: "Agency not found." }, { status: 404 });
    }

    // Don't create a new subscription if one is already active for this plan
    if (agency.subStatus === "ACTIVE" && agency.plan === plan && agency.razorpaySubId) {
      return NextResponse.json(
        { error: `You're already on the ${plan} plan.` },
        { status: 400 }
      );
    }

    // Create Razorpay subscription
    let subscriptionId: string;
    try {
      const sub = await createSubscription(plan, {
        agencyId: agency.id,
        email: agency.user.email ?? "",
        plan,
      });
      subscriptionId = sub.id;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // Store subscriptionId on agency immediately (status still TRIAL/CANCELLED until webhook confirms)
    await prisma.agency.update({
      where: { id: agency.id },
      data: { razorpaySubId: subscriptionId },
    });

    return NextResponse.json({
      subscriptionId,
      keyId: getRazorpayPublicKey(),
      plan,
      agencyName: agency.user.name ?? "Agency",
      email: agency.user.email ?? "",
    });
  } catch (error) {
    console.error("POST /api/razorpay/subscribe error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
