import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";

/**
 * POST /api/webhooks/razorpay
 *
 * Handles Razorpay subscription lifecycle webhooks.
 *
 * Events handled:
 *   subscription.activated  → set plan, subStatus=ACTIVE
 *   subscription.charged    → keep ACTIVE, store customer ID
 *   subscription.cancelled  → set subStatus=CANCELLED
 *   subscription.completed  → set subStatus=CANCELLED
 *   subscription.halted     → set subStatus=PAST_DUE
 *   payment.failed          → set subStatus=PAST_DUE
 *
 * Razorpay dashboard setup:
 *   1. Go to Razorpay → Settings → Webhooks
 *   2. Add endpoint: https://auto.branddocks.com/api/webhooks/razorpay
 *   3. Events: subscription.*, payment.failed
 *   4. Set RAZORPAY_WEBHOOK_SECRET in Vercel env vars
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";

    // Verify signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error("[webhook] Invalid Razorpay signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload: WebhookPayload;
    try {
      payload = JSON.parse(rawBody) as WebhookPayload;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const event = payload.event;
    const sub = payload.payload?.subscription?.entity;
    const payment = payload.payload?.payment?.entity;

    console.log(`[webhook] Razorpay event: ${event}`, {
      subscriptionId: sub?.id,
      planId: sub?.plan_id,
    });

    switch (event) {
      case "subscription.activated": {
        if (!sub?.id) break;
        const plan = detectPlan(sub.plan_id);
        await updateAgency(sub.id, {
          plan,
          subStatus: "ACTIVE",
          trialEndsAt: null,
          razorpayCustomerId: sub.customer_id ?? null,
        });
        break;
      }

      case "subscription.charged": {
        if (!sub?.id) break;
        const plan = detectPlan(sub.plan_id);
        // Payment succeeded — ensure status stays ACTIVE
        await updateAgency(sub.id, {
          plan,
          subStatus: "ACTIVE",
          razorpayCustomerId: sub.customer_id ?? payment?.customer_id ?? null,
        });
        break;
      }

      case "subscription.cancelled":
      case "subscription.completed": {
        if (!sub?.id) break;
        await updateAgency(sub.id, { subStatus: "CANCELLED" });
        break;
      }

      case "subscription.halted":
      case "payment.failed": {
        // Payment failed — mark as PAST_DUE (grace period before cancellation)
        const subId = sub?.id ?? payment?.subscription_id;
        if (subId) {
          await updateAgency(subId, { subStatus: "PAST_DUE" });
        }
        break;
      }

      default:
        // Unhandled event — acknowledge and move on
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook] Razorpay webhook error:", error);
    // Return 200 so Razorpay doesn't keep retrying on server errors
    return NextResponse.json({ received: true });
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STARTER_PLAN = process.env.RAZORPAY_STARTER_PLAN ?? "";
const PRO_PLAN = process.env.RAZORPAY_PRO_PLAN ?? "";

function detectPlan(planId: string | undefined): "STARTER" | "PRO" {
  if (!planId) return "STARTER";
  if (planId === PRO_PLAN) return "PRO";
  if (planId === STARTER_PLAN) return "STARTER";
  // Unknown plan ID — default to STARTER
  return "STARTER";
}

async function updateAgency(
  subscriptionId: string,
  data: {
    plan?: "STARTER" | "PRO";
    subStatus?: "ACTIVE" | "CANCELLED" | "PAST_DUE";
    trialEndsAt?: Date | null;
    razorpayCustomerId?: string | null;
  }
) {
  const agency = await prisma.agency.findFirst({
    where: { razorpaySubId: subscriptionId },
    select: { id: true },
  });

  if (!agency) {
    console.warn(`[webhook] No agency found for subscriptionId: ${subscriptionId}`);
    return;
  }

  await prisma.agency.update({
    where: { id: agency.id },
    data: {
      ...(data.plan !== undefined && { plan: data.plan }),
      ...(data.subStatus !== undefined && { subStatus: data.subStatus }),
      ...(data.trialEndsAt !== undefined && { trialEndsAt: data.trialEndsAt }),
      ...(data.razorpayCustomerId !== undefined && {
        razorpayCustomerId: data.razorpayCustomerId,
      }),
    },
  });

  console.log(`[webhook] Agency ${agency.id} updated:`, data);
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface SubscriptionEntity {
  id: string;
  plan_id: string;
  customer_id?: string;
  status: string;
}

interface PaymentEntity {
  id: string;
  subscription_id?: string;
  customer_id?: string;
  status: string;
}

interface WebhookPayload {
  event: string;
  payload?: {
    subscription?: { entity: SubscriptionEntity };
    payment?: { entity: PaymentEntity };
  };
}
