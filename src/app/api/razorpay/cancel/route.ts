import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelSubscription } from "@/lib/razorpay";

/**
 * POST /api/razorpay/cancel
 *
 * Cancels the current Razorpay subscription at the end of the billing period.
 * Sets subStatus = CANCELLED in the DB immediately (Razorpay webhook will confirm).
 *
 * The user retains access until the current billing period ends.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        subStatus: true,
        razorpaySubId: true,
      },
    });

    if (!agency) {
      return NextResponse.json({ error: "Agency not found." }, { status: 404 });
    }

    if (agency.subStatus !== "ACTIVE") {
      return NextResponse.json(
        { error: "No active subscription to cancel." },
        { status: 400 }
      );
    }

    if (!agency.razorpaySubId) {
      return NextResponse.json(
        { error: "No Razorpay subscription ID found." },
        { status: 400 }
      );
    }

    // Cancel on Razorpay (at end of billing cycle)
    try {
      await cancelSubscription(agency.razorpaySubId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: `Razorpay error: ${msg}` }, { status: 500 });
    }

    // Update DB — webhook will confirm, but update optimistically
    await prisma.agency.update({
      where: { id: agency.id },
      data: { subStatus: "CANCELLED" },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled. You retain access until your current billing period ends.",
    });
  } catch (error) {
    console.error("POST /api/razorpay/cancel error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
