import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCalendarContent, GeneratedPost } from "@/lib/gemini";
import { getEventsForMonth, formatEventsForPrompt } from "@/data/festive-calendar";

const SYSTEM_PROMPT = `You are a senior social media strategist for Indian digital marketing agencies. You create monthly content calendars for Instagram that are specific, actionable, and never generic.

Rules:
- Every post must have a SPECIFIC angle, not a vague topic
- Mix content pillars evenly across the month
- Account for Indian festivals and trending dates provided
- Include variety in post types: single_image, carousel, story, text_only
- Captions must be ready-to-post, not outlines — include emojis naturally
- Hashtags: 8-12, specific and researched-quality (not #love #instagood garbage)
- NEVER repeat the same angle twice in one month
- Write captions in the specified content language
- Match the brand's tone of voice exactly
- bestTime should be realistic for Indian audience (IST timezone)
- imageDirection: describe what the visual should show for AI image generation

Return ONLY a valid JSON array of posts. No explanation, no markdown, no preamble.`;

function buildUserPrompt(params: {
  client: {
    businessName: string;
    niche: string;
    brandColors: string[];
    toneOfVoice: string;
    targetAudience: string;
    contentLanguage: string;
    contentPillars: string[];
    extraContext: string | null;
  };
  month: number;
  year: number;
  postsPerWeek: number;
  contentMix: { educational: number; promotional: number; engagement: number };
  totalPosts: number;
  festiveEvents: string;
}): string {
  const monthName = new Date(params.year, params.month - 1, 1).toLocaleString("en-IN", {
    month: "long",
  });

  return `Generate a content calendar for the following client:

BRAND: ${params.client.businessName}
NICHE: ${params.client.niche}
BRAND COLORS: ${params.client.brandColors.join(", ")}
TONE: ${params.client.toneOfVoice}
TARGET AUDIENCE: ${params.client.targetAudience}
LANGUAGE: ${params.client.contentLanguage}
CONTENT PILLARS: ${params.client.contentPillars.join(", ")}
${params.client.extraContext ? `ADDITIONAL CONTEXT: ${params.client.extraContext}` : ""}

MONTH: ${monthName} ${params.year}
POSTS PER WEEK: ${params.postsPerWeek}
CONTENT MIX:
  - Educational/informative: ${params.contentMix.educational}%
  - Promotional/sales: ${params.contentMix.promotional}%
  - Engagement/community: ${params.contentMix.engagement}%

INDIAN CALENDAR EVENTS THIS MONTH:
${params.festiveEvents}

Generate exactly ${params.totalPosts} posts spread across the month. For each post return:
{
  "date": "YYYY-MM-DD",
  "day": "Monday",
  "postType": "single_image",
  "contentPillar": "which pillar from the list above",
  "topic": "specific topic + angle (1-2 sentences)",
  "caption": "full ready-to-post caption with emojis and line breaks",
  "hashtags": ["#tag1", "#tag2"],
  "bestTime": "19:00 IST",
  "imageDirection": "describe what the image should look like for AI image generation"
}

Return ONLY a valid JSON array. Nothing else.`;
}

function countWorkingDays(year: number, month: number): number {
  const date = new Date(year, month - 1, 1);
  let count = 0;
  while (date.getMonth() === month - 1) {
    const dow = date.getDay();
    if (dow !== 0) count++; // exclude only Sunday
    date.setDate(date.getDate() + 1);
  }
  return count;
}

function mapPostType(type: string): "SINGLE_IMAGE" | "CAROUSEL" | "STORY" | "TEXT_ONLY" {
  const t = type.toLowerCase().replace(/[^a-z_]/g, "");
  if (t.includes("carousel")) return "CAROUSEL";
  if (t.includes("story")) return "STORY";
  if (t.includes("text")) return "TEXT_ONLY";
  return "SINGLE_IMAGE";
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { clientId, month, year, postsPerWeek, contentMix } = body as {
      clientId: string;
      month: number;
      year: number;
      postsPerWeek: number;
      contentMix: { educational: number; promotional: number; engagement: number };
    };

    // Validate
    if (!clientId || !month || !year || !postsPerWeek || !contentMix) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (month < 1 || month > 12 || year < 2026 || postsPerWeek < 1 || postsPerWeek > 7) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Verify client belongs to this user's agency
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        agency: { userId: session.user.id },
        isActive: true,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Check plan limits
    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
      select: { id: true, plan: true },
    });

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    const maxPostsPerMonth = agency.plan === "PRO" ? 300 : 90;
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const existingPostCount = await prisma.post.count({
      where: {
        client: { agencyId: agency.id },
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const weeksInMonth = Math.ceil(countWorkingDays(year, month) / 6);
    // Cap at 20 posts per generation to stay within Gemini's 8192 output token limit.
    // Large months at 7/week would otherwise overflow the response window.
    const totalPosts = Math.min(postsPerWeek * weeksInMonth, 20);

    if (existingPostCount + totalPosts > maxPostsPerMonth) {
      return NextResponse.json(
        {
          error: `Post limit would be exceeded. Your ${agency.plan} plan allows ${maxPostsPerMonth} posts/month. You have ${existingPostCount} this month.`,
        },
        { status: 403 }
      );
    }

    // Build prompt
    const festiveEvents = formatEventsForPrompt(getEventsForMonth(year, month));

    const brandColors = (client.brandColors as string[]) ?? [];
    const contentPillars = (client.contentPillars as string[]) ?? [];

    const userPrompt = buildUserPrompt({
      client: {
        businessName: client.businessName,
        niche: client.niche,
        brandColors,
        toneOfVoice: client.toneOfVoice,
        targetAudience: client.targetAudience,
        contentLanguage: client.contentLanguage,
        contentPillars,
        extraContext: client.extraContext,
      },
      month,
      year,
      postsPerWeek,
      contentMix,
      totalPosts,
      festiveEvents,
    });

    // Call Gemini
    let generatedPosts: GeneratedPost[];
    try {
      generatedPosts = await generateCalendarContent({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Gemini generation error:", message);
      // Surface Gemini-specific errors to the client for easier debugging
      const clientMsg = message.includes("GOOGLE_API_KEY")
        ? "GOOGLE_API_KEY is not configured. Add it to your Vercel environment variables and redeploy."
        : message.includes("API_KEY_INVALID") || message.includes("403")
        ? "Invalid GOOGLE_API_KEY. Check the key in your Vercel environment variables."
        : message.includes("QUOTA") || message.includes("429")
        ? "Gemini API quota exceeded. Try again in a few minutes."
        : `AI generation failed: ${message.slice(0, 200)}`;
      return NextResponse.json({ error: clientMsg }, { status: 500 });
    }

    if (!generatedPosts || generatedPosts.length === 0) {
      return NextResponse.json({ error: "AI returned no posts. Try again." }, { status: 500 });
    }

    // Create Calendar record
    const calendar = await prisma.calendar.create({
      data: {
        clientId: client.id,
        month,
        year,
        postsPerWeek,
        contentMix,
      },
    });

    // Save posts to DB
    const savedPosts = await prisma.$transaction(
      generatedPosts.map((post: GeneratedPost) => {
        const scheduledDate = post.date
          ? new Date(`${post.date}T${post.bestTime?.replace(" IST", "") || "19:00"}:00+05:30`)
          : null;

        return prisma.post.create({
          data: {
            agencyId: agency.id,
            clientId: client.id,
            calendarId: calendar.id,
            caption: post.caption ?? "",
            hashtags: post.hashtags ?? [],
            postType: mapPostType(post.postType ?? "single_image"),
            contentPillar: post.contentPillar ?? null,
            topic: post.topic ?? null,
            bestTime: post.bestTime ?? null,
            imagePrompt: post.imageDirection ?? null,
            scheduledAt: scheduledDate,
            status: "DRAFT",
          },
        });
      })
    );

    return NextResponse.json({
      calendar: {
        id: calendar.id,
        month,
        year,
        clientId: client.id,
        clientName: client.businessName,
      },
      posts: savedPosts.map((p, i) => ({
        id: p.id,
        date: generatedPosts[i]?.date,
        day: generatedPosts[i]?.day,
        postType: p.postType,
        contentPillar: p.contentPillar,
        topic: generatedPosts[i]?.topic,
        caption: p.caption,
        hashtags: p.hashtags,
        bestTime: generatedPosts[i]?.bestTime,
        imageDirection: p.imagePrompt,
        scheduledAt: p.scheduledAt,
        status: p.status,
      })),
      totalGenerated: savedPosts.length,
    });
  } catch (error) {
    console.error("POST /api/generate/calendar error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
