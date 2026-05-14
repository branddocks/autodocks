/**
 * GET /api/cron/publish
 *
 * Vercel Cron Job — runs every 5 minutes.
 * Finds all APPROVED posts with scheduledAt <= now and posts them to Instagram.
 *
 * Security: Vercel sends "Authorization: Bearer <CRON_SECRET>" header automatically.
 * Set CRON_SECRET in your Vercel environment variables.
 *
 * Post lifecycle:
 *   APPROVED → POSTING (locked) → POSTED (success) | FAILED (error)
 *
 * Instagram API: Meta Graph API v19.0
 *   1. Create media container  POST /{ig-user-id}/media
 *   2. Publish container       POST /{ig-user-id}/media_publish
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const IG_API = "https://graph.facebook.com/v19.0";
const CRON_SECRET = process.env.CRON_SECRET ?? "";

export async function GET(req: Request) {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "") ?? "";

  if (CRON_SECRET && token !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();

  try {
    // ── Find due posts ──────────────────────────────────────────────────────
    // Grab up to 20 posts per run to stay within the 10s Vercel function timeout.
    const duePosts = await prisma.post.findMany({
      where: {
        status: "APPROVED",
        scheduledAt: { lte: new Date() },
        client: {
          igUserId: { not: null },
          igAccessToken: { not: null },
          isActive: true,
          agency: {
            subStatus: { in: ["ACTIVE", "TRIAL"] },
          },
        },
      },
      include: {
        client: {
          select: {
            businessName: true,
            igUserId: true,
            igAccessToken: true,
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
      take: 20,
    });

    if (duePosts.length === 0) {
      return NextResponse.json({ processed: 0, elapsed: Date.now() - startedAt });
    }

    console.log(`[cron/publish] ${duePosts.length} post(s) due for publishing`);

    // ── Lock posts immediately to prevent double-publishing ─────────────────
    await prisma.post.updateMany({
      where: { id: { in: duePosts.map((p) => p.id) } },
      data: { status: "POSTING" },
    });

    // ── Publish each post ───────────────────────────────────────────────────
    const results = await Promise.allSettled(
      duePosts.map((post) => publishPost(post))
    );

    const succeeded = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
    const failed = results.length - succeeded;

    console.log(`[cron/publish] Done — ${succeeded} posted, ${failed} failed. ${Date.now() - startedAt}ms`);

    return NextResponse.json({
      processed: duePosts.length,
      succeeded,
      failed,
      elapsed: Date.now() - startedAt,
    });
  } catch (error) {
    console.error("[cron/publish] Fatal error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ─── Publish a single post to Instagram ────────────────────────────────────────

interface PostWithClient {
  id: string;
  caption: string;
  hashtags: unknown;
  imageUrl: string | null;
  client: {
    businessName: string;
    igUserId: string | null;
    igAccessToken: string | null;
  };
}

async function publishPost(post: PostWithClient): Promise<{ success: boolean }> {
  const { igUserId, igAccessToken } = post.client;

  if (!igUserId || !igAccessToken) {
    await markFailed(post.id, "Instagram credentials missing");
    return { success: false };
  }

  if (!post.imageUrl) {
    await markFailed(post.id, "No image URL — skipped by cron");
    return { success: false };
  }

  const hashtags = (post.hashtags as string[]) ?? [];
  const fullCaption = hashtags.length
    ? `${post.caption}\n\n${hashtags.join(" ")}`
    : post.caption;

  try {
    // Step 1: Create media container
    const containerRes = await fetch(`${IG_API}/${igUserId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: post.imageUrl,
        caption: fullCaption,
        access_token: igAccessToken,
      }),
    });

    if (!containerRes.ok) {
      const err = await containerRes.json() as { error?: { message?: string } };
      const msg = err?.error?.message ?? "Failed to create media container";
      console.error(`[cron/publish] Container error for post ${post.id}:`, msg);
      await markFailed(post.id, msg);
      return { success: false };
    }

    const { id: creationId } = await containerRes.json() as { id: string };

    // Brief pause — Meta recommends waiting ~1s between container creation and publish
    await new Promise((r) => setTimeout(r, 1500));

    // Step 2: Publish the container
    const publishRes = await fetch(`${IG_API}/${igUserId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: igAccessToken,
      }),
    });

    if (!publishRes.ok) {
      const err = await publishRes.json() as { error?: { message?: string } };
      const msg = err?.error?.message ?? "Failed to publish media";
      console.error(`[cron/publish] Publish error for post ${post.id}:`, msg);
      await markFailed(post.id, msg);
      return { success: false };
    }

    const { id: igPostId } = await publishRes.json() as { id: string };

    await prisma.post.update({
      where: { id: post.id },
      data: {
        status: "POSTED",
        igPostId,
        publishedAt: new Date(),
        failureReason: null,
      },
    });

    console.log(`[cron/publish] ✓ Posted ${post.client.businessName} post ${post.id} → ig:${igPostId}`);
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[cron/publish] Exception for post ${post.id}:`, msg);
    await markFailed(post.id, msg);
    return { success: false };
  }
}

async function markFailed(postId: string, reason: string): Promise<void> {
  await prisma.post.update({
    where: { id: postId },
    data: { status: "FAILED", failureReason: reason },
  });
}
