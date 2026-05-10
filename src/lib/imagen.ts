/**
 * Imagen 3 image generation via Gemini API (same GOOGLE_API_KEY).
 * Storage via Supabase Storage REST API (no SDK needed).
 */

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY ?? "";
const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BUCKET = "post-images";

const IMAGEN_URL = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${GEMINI_API_KEY}`;

// ─── Image generation ────────────────────────────────────────────────────────

export async function generateImage(prompt: string): Promise<Buffer> {
  if (!GEMINI_API_KEY) throw new Error("GOOGLE_API_KEY is not set");

  const res = await fetch(IMAGEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1",
        safetyFilterLevel: "block_some",
        personGeneration: "dont_allow",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Imagen API error ${res.status}: ${err}`);
  }

  const data = await res.json() as {
    predictions?: { bytesBase64Encoded?: string; mimeType?: string }[];
  };

  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error("Imagen returned no image data");

  return Buffer.from(b64, "base64");
}

// ─── Image prompt builder ────────────────────────────────────────────────────

const GEMINI_TEXT_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function buildImagePrompt(params: {
  imageDirection: string;
  businessName: string;
  niche: string;
  brandColors: string[];
  postType: string;
  topic: string | null;
}): Promise<string> {
  const systemPrompt = `You convert social media post concepts into detailed image generation prompts for Imagen 3.

Rules:
- Incorporate brand colors naturally (use hex codes as color references)
- Match post type: educational posts = clean infographic style, promotional = product-focused, engagement = lifestyle/community
- Square 1:1 format for Instagram
- Clean, modern, professional aesthetic
- NO realistic human faces (use illustrated/silhouette figures if needed)
- NO text overlays (the app adds text separately)
- Specify composition, lighting, visual hierarchy
- End with quality keywords: sharp, high resolution, social media ready

Return ONLY the image prompt text. Nothing else.`;

  const userPrompt = `Create an Imagen 3 prompt for this Instagram post:

BRAND: ${params.businessName}
NICHE: ${params.niche}
BRAND COLORS: ${params.brandColors.slice(0, 3).join(", ")}
POST TYPE: ${params.postType}
POST TOPIC: ${params.topic ?? "general"}
IMAGE DIRECTION: ${params.imageDirection}`;

  const res = await fetch(GEMINI_TEXT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
    }),
  });

  if (!res.ok) {
    // Fall back to the raw imageDirection if Gemini fails
    return params.imageDirection;
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text?.trim() ?? params.imageDirection;
}

// ─── Supabase Storage upload ─────────────────────────────────────────────────

export async function uploadImageToStorage(
  imageBuffer: Buffer,
  fileName: string
): Promise<string> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error(
      "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. Add these to your environment variables."
    );
  }

  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${fileName}`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "image/png",
      "x-upsert": "true",
    },
    body: imageBuffer,
  });

  if (!res.ok) {
    const err = await res.text();
    // Bucket may not exist yet
    if (err.includes("Bucket not found") || err.includes("bucket") || res.status === 404) {
      throw new Error(
        `Supabase bucket "${BUCKET}" not found. Create it at: supabase.com → Storage → New bucket → Name: "${BUCKET}" → Public: ON`
      );
    }
    throw new Error(`Supabase upload failed ${res.status}: ${err}`);
  }

  // Return the public URL
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`;
}
