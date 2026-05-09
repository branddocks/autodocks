/**
 * Gemini API client — pure fetch, no SDK required.
 * Uses gemini-2.0-flash for cost-efficient bulk generation.
 */

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY ?? "";
const GEMINI_MODEL = "gemini-2.5-flash";
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

interface GeminiRequest {
  system_instruction?: { parts: { text: string }[] };
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
  };
}

export async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxOutputTokens?: number; jsonMode?: boolean }
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GOOGLE_API_KEY is not set in environment variables");
  }

  const body: GeminiRequest = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: options?.temperature ?? 0.8,
      maxOutputTokens: options?.maxOutputTokens ?? 32768,
      ...(options?.jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  };

  const res = await fetch(`${BASE_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${error}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty response");

  return text;
}

export async function generateCalendarContent(prompt: {
  systemPrompt: string;
  userPrompt: string;
}): Promise<GeneratedPost[]> {
  const raw = await callGemini(prompt.systemPrompt, prompt.userPrompt, {
    temperature: 0.85,
    maxOutputTokens: 32768,
    jsonMode: true,
  });

  // Strip markdown fences if present
  const cleaned = raw.replace(/^```json\n?/i, "").replace(/\n?```$/i, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }

  const posts = Array.isArray(parsed) ? parsed : (parsed as { posts?: unknown[] })?.posts ?? [];
  return posts as GeneratedPost[];
}

export interface GeneratedPost {
  date: string;           // "YYYY-MM-DD"
  day: string;            // "Monday"
  postType: string;       // "single_image" | "carousel" | "story" | "text_only"
  contentPillar: string;
  topic: string;
  caption: string;
  hashtags: string[];
  bestTime: string;       // "HH:MM IST"
  imageDirection: string;
}
