import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const IG_API = "https://graph.facebook.com/v19.0";

/**
 * POST /api/posts/[id]/publish
 * Publishes an APPROVED post to Instagram via Meta Graph API.
 * The client must have igUserId + igAccessToken set.
 * The post must have an imageUrl (Instagram requires media).
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Load post with client Instagram credentials
    const post = await prisma.post.findFirst({
      where: {
        id,
        client: { agency: { userId: session.user.id } },
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
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.status === "POSTED") {
      return NextResponse.json({ error: "Post already published" }, { status: 400 });
    }

    if (post.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Only approved posts can be published. Approve the post first." },
        { status: 400 }
      );
    }

    const { igUserId, igAccessToken } = post.client;

    if (!igUserId || !igAccessToken) {
      return NextResponse.json(
        {
          error:
            "Instagram not connected for this client. Add the Access Token and Business Account ID in client settings.",
        },
        { status: 400 }
      );
    }

    if (!post.imageUrl) {
      return NextResponse.json(
        {
          error:
            "No image attached to this post. Add an image URL first, then publish.",
        },
        { status: 400 }
      );
    }

    // Build the full caption (caption + hashtags)
    const hashtags = (post.hashtags as string[]) ?? [];
    const fullCaption = hashtags.length
      ? `${post.caption}\n\n${hashtags.join(" ")}`
      : post.caption;

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
      const err = await containerRes.json();
      const msg = err?.error?.message ?? "Failed to create media container";
      console.error("IG container error:", err);
      await prisma.post.update({
        where: { id },
        data: { failureReason: msg },
      });
      return NextResponse.json({ error: `Instagram error: ${msg}` }, { status: 502 });
    }

    const { id: creationId } = await containerRes.json();

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
      const err = await publishRes.json();
      const msg = err?.error?.message ?? "Failed to publish media";
      console.error("IG publish error:", err);
      await prisma.post.update({
        where: { id },
        data: { failureReason: msg },
      });
      return NextResponse.json({ error: `Instagram error: ${msg}` }, { status: 502 });
    }

    const { id: igPostId } = await publishRes.json();

    // Update post in DB
    const updated = await prisma.post.update({
      where: { id },
      data: {
        status: "POSTED",
        igPostId,
        publishedAt: new Date(),
        failureReason: null,
      },
    });

    return NextResponse.json({
      success: true,
      igPostId,
      publishedAt: updated.publishedAt,
    });
  } catch (error) {
    console.error("POST /api/posts/[id]/publish error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
