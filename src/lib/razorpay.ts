/**
 * Razorpay server-side utilities.
 *
 * Env vars required:
 *   RAZORPAY_KEY_ID        — test or live key ID
 *   RAZORPAY_KEY_SECRET    — test or live key secret
 *   RAZORPAY_STARTER_PLAN  — plan_id for Starter ₹499/mo
 *   RAZORPAY_PRO_PLAN      — plan_id for Pro ₹999/mo
 *   RAZORPAY_WEBHOOK_SECRET — webhook secret (set in Razorpay dashboard)
 */

import Razorpay from "razorpay";
import crypto from "crypto";

// ─── Client ─────────────────────────────────────────────────────────────────

const KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";

if (!KEY_ID || !KEY_SECRET) {
  // Don't crash at import time — surface error when methods are called
  console.warn("[razorpay] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set.");
}

export const razorpay = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET,
});

// ─── Plan helpers ────────────────────────────────────────────────────────────

export const PLAN_IDS: Record<"STARTER" | "PRO", string> = {
  STARTER: process.env.RAZORPAY_STARTER_PLAN ?? "",
  PRO: process.env.RAZORPAY_PRO_PLAN ?? "",
};

export const PLAN_AMOUNTS: Record<"STARTER" | "PRO", number> = {
  STARTER: 49900, // ₹499 in paise
  PRO: 99900,     // ₹999 in paise
};

// ─── Subscription creation ───────────────────────────────────────────────────

export async function createSubscription(
  plan: "STARTER" | "PRO",
  notes?: Record<string, string>
): Promise<{ id: string; short_url: string }> {
  if (!KEY_ID || !KEY_SECRET) {
    throw new Error(
      "Razorpay keys not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your environment variables."
    );
  }

  const planId = PLAN_IDS[plan];
  if (!planId) {
    throw new Error(
      `Razorpay plan ID for ${plan} not configured. Add RAZORPAY_${plan}_PLAN to your environment variables, then create the plan in the Razorpay dashboard.`
    );
  }

  const sub = await razorpay.subscriptions.create({
    plan_id: planId,
    total_count: 12, // max 12 billing cycles (1 year); auto-renews after
    quantity: 1,
    notes: notes ?? {},
  });

  return { id: sub.id as string, short_url: (sub as Record<string, unknown>).short_url as string ?? "" };
}

// ─── Subscription cancellation ───────────────────────────────────────────────

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  if (!KEY_ID || !KEY_SECRET) {
    throw new Error("Razorpay keys not configured.");
  }
  // cancel_at_cycle_end=1 → cancel at end of billing period (not immediately)
  await razorpay.subscriptions.cancel(subscriptionId, true);
}

// ─── Webhook signature verification ─────────────────────────────────────────

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

export function verifyWebhookSignature(body: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) {
    console.error("[razorpay] RAZORPAY_WEBHOOK_SECRET not set — webhook verification skipped.");
    return true; // In dev without secret, allow through (log a warning)
  }
  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

// ─── Public key (safe to expose to client) ───────────────────────────────────

export function getRazorpayPublicKey(): string {
  return KEY_ID;
}
