import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const GEMINI_TEXT_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY ?? ""}`;

/**
 * POST /api/posts/[id]/regenerate-caption
 * Calls Gemini to rewrite a post caption with a different angle.
 * Returns { caption } — caller saves via PATCH /api/posts/[id] if they want to keep it.
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

    const post = await prisma.post.findFirst({
      where: {
        id,
        client: { agency: { userId: session.user.id } },
      },
      include: {
        client: {
          select: {
            businessName: true,
            niche: true,
            toneOfVoice: true,
            contentLanguage: true,
            targetAudience: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const prompt = `Rewrite this Instagram caption with a completely different angle.

BRAND: ${post.client.businessName}
NICHE: ${post.client.niche}
TONE: ${post.client.toneOfVoice}
LANGUAGE: ${post.client.contentLanguage}
AUDIENCE: ${post.client.targetAudience}
POST TYPE: ${post.postType}
${post.topic ? `TOPIC: ${post.topic}` : ""}
${post.contentPillar ? `CONTENT PILLAR: ${post.contentPillar}` : ""}

ORIGINAL CAPTION:
${post.caption}

HASHTAGS TO KEEP (reuse same hashtags at the end):
${Array.isArray(post.hashtags) ? (post.hashtags as string[]).join(" ") : ""}

Rules:
- Change the HOOK (first 1-2 lines) completely — different emotion, angle, or question
- Change the story/body structure — don't just rephrase the original
- Change the CTA (call to action) at the end
- Keep the same language (${post.client.contentLanguage}), tone, and emojis style
- Keep the same hashtags at the end
- Do NOT add any prefix like "Here is the caption:" — return ONLY the caption text

Return ONLY the new caption. Nothing else.`;

    const res = await fetch(GEMINI_TEXT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 1024 },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      const msg = err.includes("API_KEY_INVALID") || err.includes("403")
        ? "Invalid GOOGLE_API_KEY. Check Vercel environment variables."
        : err.includes("429") || err.includes("QUOTA")
        ? "Gemini quota exceeded. Try again in a minute."
        : `Gemini error: ${err.slice(0, 200)}`;
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    const data = await res.json();
    const newCaption = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!newCaption) {
      return NextResponse.json({ error: "Gemini returned empty caption. Try again." }, { status: 500 });
    }

    // Auto-save to DB
    await prisma.post.update({
      where: { id },
      data: { caption: newCaption },
    });

    return NextResponse.json({ caption: newCaption });
  } catch (error) {
    console.error("POST /api/posts/[id]/regenerate-caption error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
