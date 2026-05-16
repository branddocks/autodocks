/**
 * GET /api/cron/publish
 *
 * Vercel Cron Job — runs daily at midnight UTC.
 * Finds all APPROVED posts with scheduledAt <= now and publishes them to
 * every platform the client has connected: Instagram, Facebook, LinkedIn.
 *
 * Security: Vercel sends "Authorization: Bearer <CRON_SECRET>" automatically.
 * Set CRON_SECRET in your Vercel environment variables.
 *
 * Post lifecycle:
 *   APPROVED → POSTING (locked) → POSTED (success) | FAILED (all platforms failed)
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const IG_API = "https://graph.facebook.com/v19.0";
const LI_API = "https://api.linkedin.com/v2";
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
    // Include any client with at least one platform connected.
    const duePosts = await prisma.post.findMany({
      where: {
        status: "APPROVED",
        scheduledAt: { lte: new Date() },
        client: {
          isActive: true,
          agency: { subStatus: { in: ["ACTIVE", "TRIAL"] } },
          OR: [
            { igUserId: { not: null }, igAccessToken: { not: null } },
            { fbPageId: { not: null }, fbPageToken: { not: null } },
            { linkedInOrgId: { not: null }, linkedInToken: { not: null } },
          ],
        },
      },
      include: {
        client: {
          select: {
            businessName: true,
            igUserId: true,
            igAccessToken: true,
            fbPageId: true,
            fbPageToken: true,
            linkedInOrgId: true,
            linkedInToken: true,
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
      take: 20,
    });

    if (duePosts.length === 0) {
      return NextResponse.json({ processed: 0, elapsed: Date.now() - startedAt });
    }

    console.log(`[cron/publish] ${duePosts.length} post(s) due`);

    // ── Lock immediately to prevent double-publishing ───────────────────────
    await prisma.post.updateMany({
      where: { id: { in: duePosts.map((p) => p.id) } },
      data: { status: "POSTING" },
    });

    // ── Publish each post to all connected platforms ────────────────────────
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostWithClient {
  id: string;
  caption: string;
  hashtags: unknown;
  imageUrl: string | null;
  client: {
    businessName: string;
    igUserId: string | null;
    igAccessToken: string | null;
    fbPageId: string | null;
    fbPageToken: string | null;
    linkedInOrgId: string | null;
    linkedInToken: string | null;
  };
}

// ─── Main publish orchestrator ────────────────────────────────────────────────

async function publishPost(post: PostWithClient): Promise<{ success: boolean }> {
  const hashtags = (post.hashtags as string[]) ?? [];
  const fullCaption = hashtags.length
    ? `${post.caption}\n\n${hashtags.join(" ")}`
    : post.caption;

  const platforms: Promise<{ platform: string; ok: boolean; id?: string; error?: string }>[] = [];

  // Instagram
  if (post.client.igUserId && post.client.igAccessToken && post.imageUrl) {
    platforms.push(publishInstagram(post, fullCaption));
  }

  // Facebook
  if (post.client.fbPageId && post.client.fbPageToken) {
    platforms.push(publishFacebook(post, fullCaption));
  }

  // LinkedIn
  if (post.client.linkedInOrgId && post.client.linkedInToken) {
    platforms.push(publishLinkedIn(post, fullCaption));
  }

  if (platforms.length === 0) {
    await markFailed(post.id, "No connected platforms with credentials");
    return { success: false };
  }

  const results = await Promise.allSettled(platforms);
  const outcomes = results.map((r) =>
    r.status === "fulfilled" ? r.value : { platform: "unknown", ok: false, error: String(r.reason) }
  );

  const anySuccess = outcomes.some((o) => o.ok);
  const igResult = outcomes.find((o) => o.platform === "instagram");
  const failedPlatforms = outcomes.filter((o) => !o.ok).map((o) => `${o.platform}: ${o.error}`);

  if (anySuccess) {
    await prisma.post.update({
      where: { id: post.id },
      data: {
        status: "POSTED",
        igPostId: igResult?.ok ? igResult.id : undefined,
        publishedAt: new Date(),
        failureReason: failedPlatforms.length
          ? `Partial: ${failedPlatforms.join(" | ")}`
          : null,
      },
    });
    console.log(`[cron/publish] ✓ ${post.client.businessName} — ${outcomes.filter((o) => o.ok).map((o) => o.platform).join(", ")}`);
    return { success: true };
  } else {
    const reason = failedPlatforms.join(" | ");
    await markFailed(post.id, reason);
    return { success: false };
  }
}

// ─── Instagram ────────────────────────────────────────────────────────────────

async function publishInstagram(post: PostWithClient, caption: string) {
  const { igUserId, igAccessToken } = post.client;

  try {
    // Step 1: Create container
    const containerRes = await fetch(`${IG_API}/${igUserId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: post.imageUrl, caption, access_token: igAccessToken }),
    });

    if (!containerRes.ok) {
      const err = await containerRes.json() as { error?: { message?: string } };
      return { platform: "instagram", ok: false, error: err?.error?.message ?? "Container creation failed" };
    }

    const { id: creationId } = await containerRes.json() as { id: string };
    await new Promise((r) => setTimeout(r, 1500));

    // Step 2: Publish
    const publishRes = await fetch(`${IG_API}/${igUserId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: creationId, access_token: igAccessToken }),
    });

    if (!publishRes.ok) {
      const err = await publishRes.json() as { error?: { message?: string } };
      return { platform: "instagram", ok: false, error: err?.error?.message ?? "Publish failed" };
    }

    const { id: igPostId } = await publishRes.json() as { id: string };
    return { platform: "instagram", ok: true, id: igPostId };
  } catch (err) {
    return { platform: "instagram", ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ─── Facebook ────────────────────────────────────────────────────────────────

async function publishFacebook(post: PostWithClient, caption: string) {
  const { fbPageId, fbPageToken } = post.client;

  try {
    const endpoint = post.imageUrl
      ? `${IG_API}/${fbPageId}/photos`
      : `${IG_API}/${fbPageId}/feed`;

    const body = post.imageUrl
      ? { url: post.imageUrl, caption, access_token: fbPageToken }
      : { message: caption, access_token: fbPageToken };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json() as { error?: { message?: string } };
      return { platform: "facebook", ok: false, error: err?.error?.message ?? "Facebook post failed" };
    }

    const { id } = await res.json() as { id: string };
    return { platform: "facebook", ok: true, id };
  } catch (err) {
    return { platform: "facebook", ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ─── LinkedIn ─────────────────────────────────────────────────────────────────

async function publishLinkedIn(post: PostWithClient, caption: string) {
  const { linkedInOrgId, linkedInToken } = post.client;
  const orgUrn = `urn:li:organization:${linkedInOrgId}`;
  const headers = {
    "Authorization": `Bearer ${linkedInToken}`,
    "Content-Type": "application/json",
    "X-Restli-Protocol-Version": "2.0.0",
  };

  try {
    let mediaAssetUrn: string | null = null;

    // If there's an image, upload it to LinkedIn first
    if (post.imageUrl) {
      // Step 1: Register the upload
      const registerRes = await fetch(`${LI_API}/assets?action=registerUpload`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
            owner: orgUrn,
            serviceRelationships: [
              { relationshipType: "OWNER", identifier: "urn:li:userGeneratedContent" },
            ],
          },
        }),
      });

      if (!registerRes.ok) {
        const err = await registerRes.json() as { message?: string };
        return { platform: "linkedin", ok: false, error: `Upload registration failed: ${err?.message ?? registerRes.status}` };
      }

      const registerData = await registerRes.json() as {
        value: { uploadMechanism: { "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest": { uploadUrl: string } }; asset: string };
      };
      const uploadUrl = registerData.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
      mediaAssetUrn = registerData.value.asset;

      // Step 2: Fetch the image and upload the binary to LinkedIn
      const imgRes = await fetch(post.imageUrl);
      if (!imgRes.ok) {
        return { platform: "linkedin", ok: false, error: "Failed to fetch image for upload" };
      }
      const imgBuffer = await imgRes.arrayBuffer();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${linkedInToken}` },
        body: imgBuffer,
      });

      if (!uploadRes.ok) {
        return { platform: "linkedin", ok: false, error: `Image upload failed: ${uploadRes.status}` };
      }
    }

    // Step 3: Create the UGC post
    const ugcBody = mediaAssetUrn
      ? {
          author: orgUrn,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: caption },
              shareMediaCategory: "IMAGE",
              media: [{ status: "READY", media: mediaAssetUrn }],
            },
          },
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
        }
      : {
          author: orgUrn,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: caption },
              shareMediaCategory: "NONE",
            },
          },
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
        };

    const postRes = await fetch(`${LI_API}/ugcPosts`, {
      method: "POST",
      headers,
      body: JSON.stringify(ugcBody),
    });

    if (!postRes.ok) {
      const err = await postRes.json() as { message?: string };
      return { platform: "linkedin", ok: false, error: err?.message ?? `LinkedIn post failed: ${postRes.status}` };
    }

    const liPostId = postRes.headers.get("x-restli-id") ?? "posted";
    return { platform: "linkedin", ok: true, id: liPostId };
  } catch (err) {
    return { platform: "linkedin", ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function markFailed(postId: string, reason: string): Promise<void> {
  await prisma.post.update({
    where: { id: postId },
    data: { status: "FAILED", failureReason: reason },
  });
}
