import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildImagePrompt, generateImage, uploadImageToStorage } from "@/lib/imagen";

/**
 * POST /api/generate/image
 * Body: { postId: string }
 *
 * 1. Loads the post + client data
 * 2. Builds an Imagen 3 prompt from imageDirection + brand info
 * 3. Calls Imagen 3 API (via Gemini key)
 * 4. Uploads to Supabase Storage
 * 5. Saves imageUrl to the post
 * 6. Returns { imageUrl }
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await req.json() as { postId: string };
    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    // Load post + client brand info
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        client: { agency: { userId: session.user.id } },
      },
      include: {
        client: {
          select: {
            businessName: true,
            niche: true,
            brandColors: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const brandColors = (post.client.brandColors as string[]) ?? ["#D4764E", "#1A1A1A"];

    // imagePrompt stores the Gemini-generated imageDirection; fall back to topic/caption
    const rawDirection =
      post.imagePrompt ?? post.topic ?? post.caption.slice(0, 120);

    // Step 1: Build an enhanced image prompt via Gemini
    let finalPrompt: string;
    try {
      finalPrompt = await buildImagePrompt({
        imageDirection: rawDirection,
        businessName: post.client.businessName,
        niche: post.client.niche,
        brandColors,
        postType: post.postType,
        topic: post.topic,
      });
    } catch {
      // If Gemini prompt builder fails, use the raw direction directly
      finalPrompt = rawDirection;
    }

    // Step 2: Generate image with Imagen 3
    let imageBuffer: Buffer;
    try {
      imageBuffer = await generateImage(finalPrompt);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const clientMsg = msg.includes("GOOGLE_API_KEY")
        ? "GOOGLE_API_KEY is not configured."
        : msg.includes("403") || msg.includes("API_KEY_INVALID")
        ? "Invalid GOOGLE_API_KEY. Check Vercel environment variables."
        : msg.includes("QUOTA") || msg.includes("429")
        ? "Imagen API quota exceeded. Try again in a few minutes."
        : msg.includes("imagen-3.0-generate-001") || msg.includes("not found")
        ? "Imagen 3 model not available on your API key tier. Upgrade to Gemini API Tier 1 (pay-as-you-go)."
        : `Image generation failed: ${msg.slice(0, 200)}`;
      return NextResponse.json({ error: clientMsg }, { status: 500 });
    }

    // Step 3: Upload to Supabase Storage
    const fileName = `${post.clientId}/${post.id}-${Date.now()}.png`;
    let imageUrl: string;
    try {
      imageUrl = await uploadImageToStorage(imageBuffer, fileName);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // Step 4: Save imageUrl to post
    await prisma.post.update({
      where: { id: postId },
      data: { imageUrl },
    });

    return NextResponse.json({ imageUrl, prompt: finalPrompt });
  } catch (error) {
    console.error("POST /api/generate/image error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
