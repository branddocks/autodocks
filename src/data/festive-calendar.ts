/**
 * Indian festive + awareness calendar 2026
 * Competitive advantage: no international tool has this built-in.
 *
 * Date format: MM-DD (month-day, year-agnostic where recurring)
 * For lunar festivals (dates change yearly), actual 2026 dates are used.
 */

export interface FestiveEvent {
  date: string; // "YYYY-MM-DD"
  name: string;
  type: "festival" | "national_day" | "awareness_day" | "trending" | "shopping";
  importance: "high" | "medium" | "low";
  industries: string[]; // ["all"] or specific niches
  suggestedAngles: string[];
}

export const FESTIVE_CALENDAR_2026: FestiveEvent[] = [
  // ── JANUARY ──────────────────────────────────────────────────────────────
  {
    date: "2026-01-01",
    name: "New Year's Day",
    type: "trending",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "New year resolutions for [industry]",
      "What's changing in [niche] in 2026",
      "Year in review + goals ahead",
    ],
  },
  {
    date: "2026-01-14",
    name: "Makar Sankranti / Uttarayan / Pongal / Lohri",
    type: "festival",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Festival wishes from the brand",
      "The meaning of harvest festivals for [industry]",
      "Kite season — creative brand tie-in",
    ],
  },
  {
    date: "2026-01-23",
    name: "Netaji Subhash Chandra Bose Jayanti",
    type: "national_day",
    importance: "medium",
    industries: ["all"],
    suggestedAngles: [
      "Leadership lessons from Netaji for [industry]",
      "Patriotic brand moment",
    ],
  },
  {
    date: "2026-01-26",
    name: "Republic Day",
    type: "national_day",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Proud to be Indian — brand story",
      "Republic Day special offer",
      "What freedom means to our business",
    ],
  },

  // ── FEBRUARY ─────────────────────────────────────────────────────────────
  {
    date: "2026-02-04",
    name: "World Cancer Day",
    type: "awareness_day",
    importance: "medium",
    industries: ["healthcare", "wellness", "nutrition", "fitness"],
    suggestedAngles: [
      "Prevention tips for [niche] audience",
      "Supporting cancer awareness",
    ],
  },
  {
    date: "2026-02-14",
    name: "Valentine's Day",
    type: "trending",
    importance: "high",
    industries: ["fashion", "food", "beauty", "jewellery", "gifting", "hospitality"],
    suggestedAngles: [
      "Valentine's special product/service highlight",
      "Gift ideas for Valentine's from [brand]",
      "Self-love campaign for the brand",
    ],
  },
  {
    date: "2026-02-18",
    name: "Maha Shivratri",
    type: "festival",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Devotional wishes post",
      "Spiritual connection to brand values",
    ],
  },
  {
    date: "2026-02-19",
    name: "Chhatrapati Shivaji Maharaj Jayanti",
    type: "national_day",
    importance: "medium",
    industries: ["all"],
    suggestedAngles: [
      "Leadership and courage in business",
      "Maharashtra brand moment",
    ],
  },
  {
    date: "2026-02-20",
    name: "World Day of Social Justice",
    type: "awareness_day",
    importance: "low",
    industries: ["ngo", "education", "social_enterprise"],
    suggestedAngles: ["Our commitment to inclusivity and fairness"],
  },
  {
    date: "2026-02-28",
    name: "National Science Day",
    type: "national_day",
    importance: "medium",
    industries: ["technology", "education", "healthcare", "engineering"],
    suggestedAngles: [
      "Science behind our product/service",
      "Innovation we're proud of",
    ],
  },

  // ── MARCH ────────────────────────────────────────────────────────────────
  {
    date: "2026-03-03",
    name: "Holi",
    type: "festival",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Colours of [brand/industry] — Holi special",
      "Festival wishes with brand colors",
      "Behind the scenes: team Holi celebration",
    ],
  },
  {
    date: "2026-03-08",
    name: "International Women's Day",
    type: "awareness_day",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Women in [industry] — spotlight post",
      "Our women team members",
      "Products/services empowering women",
      "#BreakTheBias — brand stand",
    ],
  },
  {
    date: "2026-03-15",
    name: "World Consumer Rights Day",
    type: "awareness_day",
    importance: "low",
    industries: ["retail", "ecommerce", "legal", "finance"],
    suggestedAngles: ["Your rights as our customer", "Our commitment to you"],
  },
  {
    date: "2026-03-20",
    name: "World Storytelling Day",
    type: "awareness_day",
    importance: "low",
    industries: ["marketing", "content", "media", "education"],
    suggestedAngles: ["Our brand story", "Client success story"],
  },
  {
    date: "2026-03-21",
    name: "World Poetry Day / World Down Syndrome Day",
    type: "awareness_day",
    importance: "low",
    industries: ["education", "healthcare", "ngo"],
    suggestedAngles: ["Creative writing for the brand", "Inclusion advocacy"],
  },
  {
    date: "2026-03-22",
    name: "World Water Day",
    type: "awareness_day",
    importance: "medium",
    industries: ["wellness", "food", "agriculture", "environment", "ngo"],
    suggestedAngles: [
      "Our water sustainability practices",
      "Water conservation tips from [niche]",
    ],
  },

  // ── APRIL ────────────────────────────────────────────────────────────────
  {
    date: "2026-04-01",
    name: "April Fool's Day",
    type: "trending",
    importance: "medium",
    industries: ["all"],
    suggestedAngles: ["Fun brand joke/prank post (safe for brand)"],
  },
  {
    date: "2026-04-02",
    name: "World Autism Awareness Day",
    type: "awareness_day",
    importance: "medium",
    industries: ["healthcare", "education", "ngo"],
    suggestedAngles: ["Awareness and inclusion advocacy"],
  },
  {
    date: "2026-04-05",
    name: "Ram Navami",
    type: "festival",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Festival wishes",
      "Values of Ram applied to business — leadership, integrity",
    ],
  },
  {
    date: "2026-04-07",
    name: "World Health Day",
    type: "awareness_day",
    importance: "high",
    industries: ["healthcare", "fitness", "wellness", "food", "nutrition"],
    suggestedAngles: [
      "Health tips from [brand/niche]",
      "Our commitment to customer health",
      "World Health Day special campaign",
    ],
  },
  {
    date: "2026-04-13",
    name: "Baisakhi / Vishu / Tamil New Year",
    type: "festival",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Harvest festival wishes",
      "New beginnings — brand message",
    ],
  },
  {
    date: "2026-04-14",
    name: "Dr. Ambedkar Jayanti",
    type: "national_day",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Equality and social justice — brand stand",
      "Education and empowerment",
    ],
  },
  {
    date: "2026-04-18",
    name: "Good Friday",
    type: "festival",
    importance: "medium",
    industries: ["all"],
    suggestedAngles: ["Respectful acknowledgement post"],
  },
  {
    date: "2026-04-20",
    name: "Easter Sunday",
    type: "festival",
    importance: "medium",
    industries: ["food", "gifting", "hospitality", "retail"],
    suggestedAngles: ["New beginnings theme", "Easter special"],
  },
  {
    date: "2026-04-22",
    name: "Earth Day",
    type: "awareness_day",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Our sustainability practices",
      "Eco-friendly products/services",
      "What [brand] does for the planet",
    ],
  },
  {
    date: "2026-04-29",
    name: "International Dance Day",
    type: "awareness_day",
    importance: "low",
    industries: ["fitness", "entertainment", "education", "lifestyle"],
    suggestedAngles: ["Fun brand reel/video", "Dance = joy = brand"],
  },

  // ── MAY ──────────────────────────────────────────────────────────────────
  {
    date: "2026-05-01",
    name: "Labour Day / Maharashtra Day",
    type: "national_day",
    importance: "medium",
    industries: ["all"],
    suggestedAngles: [
      "Celebrating our team",
      "Behind the scenes: the people behind [brand]",
    ],
  },
  {
    date: "2026-05-04",
    name: "Star Wars Day (May the 4th be with you)",
    type: "trending",
    importance: "low",
    industries: ["technology", "gaming", "entertainment", "youth brands"],
    suggestedAngles: ["Fun pop culture tie-in"],
  },
  {
    date: "2026-05-10",
    name: "Mother's Day",
    type: "trending",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Mother's Day tribute from the brand",
      "Gift ideas for mom from [brand]",
      "Stories of strong mothers in [industry]",
    ],
  },
  {
    date: "2026-05-15",
    name: "International Day of Families",
    type: "awareness_day",
    importance: "low",
    industries: ["food", "hospitality", "real_estate", "education"],
    suggestedAngles: ["Family values — brand connection"],
  },
  {
    date: "2026-05-17",
    name: "World Hypertension Day",
    type: "awareness_day",
    importance: "medium",
    industries: ["healthcare", "fitness", "wellness", "nutrition"],
    suggestedAngles: ["Blood pressure tips for [audience]"],
  },
  {
    date: "2026-05-21",
    name: "Anti-Terrorism Day",
    type: "national_day",
    importance: "low",
    industries: ["all"],
    suggestedAngles: ["Peace and unity — brand message"],
  },
  {
    date: "2026-05-31",
    name: "World No Tobacco Day",
    type: "awareness_day",
    importance: "medium",
    industries: ["healthcare", "wellness", "fitness"],
    suggestedAngles: ["Health awareness campaign"],
  },

  // ── JUNE ─────────────────────────────────────────────────────────────────
  {
    date: "2026-06-01",
    name: "Global Day of Parents / World Milk Day",
    type: "awareness_day",
    importance: "low",
    industries: ["food", "education", "parenting", "nutrition"],
    suggestedAngles: ["Celebrating parents", "Nutrition awareness"],
  },
  {
    date: "2026-06-05",
    name: "World Environment Day",
    type: "awareness_day",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Our green initiatives",
      "Environmental impact of [industry]",
      "Go green with [brand]",
    ],
  },
  {
    date: "2026-06-07",
    name: "Eid al-Adha (Bakrid)",
    type: "festival",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Eid Mubarak wishes",
      "Sacrifice and gratitude — brand message",
    ],
  },
  {
    date: "2026-06-15",
    name: "Father's Day",
    type: "trending",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Father's Day tribute",
      "Gift ideas for dad",
      "Lessons from our fathers",
    ],
  },
  {
    date: "2026-06-21",
    name: "International Yoga Day / Father's Day (some regions)",
    type: "awareness_day",
    importance: "high",
    industries: ["fitness", "wellness", "healthcare", "lifestyle"],
    suggestedAngles: [
      "Yoga for [audience/profession]",
      "Team yoga challenge",
      "Mind-body balance in [industry]",
    ],
  },
  {
    date: "2026-06-26",
    name: "International Day Against Drug Abuse",
    type: "awareness_day",
    importance: "low",
    industries: ["healthcare", "ngo", "education", "youth brands"],
    suggestedAngles: ["Mental health and wellness advocacy"],
  },

  // ── JULY ─────────────────────────────────────────────────────────────────
  {
    date: "2026-07-01",
    name: "National Doctor's Day",
    type: "national_day",
    importance: "high",
    industries: ["healthcare", "pharma", "wellness", "medical_devices"],
    suggestedAngles: [
      "Thank a doctor today",
      "Our partnership with healthcare professionals",
    ],
  },
  {
    date: "2026-07-11",
    name: "World Population Day",
    type: "awareness_day",
    importance: "low",
    industries: ["ngo", "education", "social_enterprise"],
    suggestedAngles: ["Sustainable growth", "Building for India's future"],
  },
  {
    date: "2026-07-28",
    name: "Muharram / World Hepatitis Day",
    type: "festival",
    importance: "medium",
    industries: ["all"],
    suggestedAngles: ["Respectful acknowledgement", "Health awareness"],
  },

  // ── AUGUST ───────────────────────────────────────────────────────────────
  {
    date: "2026-08-01",
    name: "World Breastfeeding Week starts",
    type: "awareness_day",
    importance: "low",
    industries: ["healthcare", "nutrition", "parenting", "wellness"],
    suggestedAngles: ["Maternal health advocacy"],
  },
  {
    date: "2026-08-06",
    name: "Hiroshima Day",
    type: "awareness_day",
    importance: "low",
    industries: ["education", "ngo"],
    suggestedAngles: ["Peace advocacy"],
  },
  {
    date: "2026-08-12",
    name: "International Youth Day",
    type: "awareness_day",
    importance: "medium",
    industries: ["education", "technology", "startup", "youth brands"],
    suggestedAngles: [
      "Empowering the next generation",
      "Youth in [industry]",
    ],
  },
  {
    date: "2026-08-15",
    name: "Independence Day",
    type: "national_day",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Independence Day tribute — what freedom means to us",
      "Made in India pride",
      "Jai Hind — patriotic brand moment",
      "Independence Day special offer",
    ],
  },
  {
    date: "2026-08-22",
    name: "Raksha Bandhan",
    type: "festival",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Rakhi wishes from the brand",
      "Brother-sister bond — emotional storytelling",
      "Gift ideas for Rakhi",
    ],
  },
  {
    date: "2026-08-25",
    name: "Janmashtami",
    type: "festival",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Janmashtami wishes",
      "Life lessons from Krishna for [industry]",
    ],
  },
  {
    date: "2026-08-29",
    name: "National Sports Day",
    type: "national_day",
    importance: "medium",
    industries: ["fitness", "sports", "health", "youth brands"],
    suggestedAngles: [
      "Celebrating Indian athletes",
      "Sports and [brand] — connection",
    ],
  },

  // ── SEPTEMBER ─────────────────────────────────────────────────────────────
  {
    date: "2026-09-05",
    name: "Teacher's Day",
    type: "national_day",
    importance: "high",
    industries: ["education", "edtech", "all"],
    suggestedAngles: [
      "Thank your teacher — heartfelt post",
      "The teacher who inspired [brand/founder]",
      "Our mentors and guides",
    ],
  },
  {
    date: "2026-09-08",
    name: "International Literacy Day",
    type: "awareness_day",
    importance: "medium",
    industries: ["education", "edtech", "ngo", "publishing"],
    suggestedAngles: ["Reading and learning advocacy"],
  },
  {
    date: "2026-09-16",
    name: "World Ozone Day",
    type: "awareness_day",
    importance: "low",
    industries: ["environment", "sustainability", "manufacturing"],
    suggestedAngles: ["Our environment commitment"],
  },
  {
    date: "2026-09-21",
    name: "World Alzheimer's Day / International Day of Peace",
    type: "awareness_day",
    importance: "medium",
    industries: ["healthcare", "wellness", "ngo"],
    suggestedAngles: ["Health awareness", "Spreading peace and positivity"],
  },
  {
    date: "2026-09-27",
    name: "World Tourism Day",
    type: "awareness_day",
    importance: "medium",
    industries: ["travel", "hospitality", "food", "lifestyle"],
    suggestedAngles: [
      "Hidden gems in [city/region]",
      "Travel and [brand] — lifestyle tie-in",
    ],
  },

  // ── OCTOBER ──────────────────────────────────────────────────────────────
  {
    date: "2026-10-02",
    name: "Gandhi Jayanti / World Non-Violence Day",
    type: "national_day",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Lessons from Bapu for business",
      "Truth and non-violence in brand values",
      "Swachh Bharat — cleanliness campaign",
    ],
  },
  {
    date: "2026-10-05",
    name: "World Teachers' Day",
    type: "awareness_day",
    importance: "medium",
    industries: ["education", "edtech"],
    suggestedAngles: ["Global teacher appreciation"],
  },
  {
    date: "2026-10-10",
    name: "World Mental Health Day",
    type: "awareness_day",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Mental health at the workplace",
      "Our team well-being practices",
      "Break the stigma — advocacy post",
      "Mental health tips for [audience]",
    ],
  },
  {
    date: "2026-10-14",
    name: "Navratri begins",
    type: "festival",
    importance: "high",
    industries: ["fashion", "food", "jewellery", "lifestyle", "retail"],
    suggestedAngles: [
      "Navratri collection launch",
      "Festival fashion/food special",
      "9 days, 9 colours — brand content series",
    ],
  },
  {
    date: "2026-10-20",
    name: "Dussehra / Vijayadashami",
    type: "festival",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Victory of good over evil — brand message",
      "Dussehra wishes",
      "What evil habits is your brand burning this Dussehra?",
    ],
  },
  {
    date: "2026-10-31",
    name: "Halloween",
    type: "trending",
    importance: "medium",
    industries: ["food", "fashion", "retail", "entertainment", "youth brands"],
    suggestedAngles: [
      "Spooky brand content",
      "Halloween special",
    ],
  },

  // ── NOVEMBER ─────────────────────────────────────────────────────────────
  {
    date: "2026-11-01",
    name: "Diwali",
    type: "festival",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Diwali wishes — lights, prosperity, joy",
      "Diwali sale / festive offer",
      "Behind the scenes: how our team celebrates",
      "Lights of [niche] — creative brand moment",
    ],
  },
  {
    date: "2026-11-05",
    name: "Bhai Dooj",
    type: "festival",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Bhai Dooj wishes",
      "Sibling bond storytelling",
      "Gift ideas for Bhai Dooj",
    ],
  },
  {
    date: "2026-11-11",
    name: "Children's Day (Nehru Jayanti) / Veteran's Day",
    type: "national_day",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Celebrating the child in all of us",
      "Our brand for the next generation",
      "Nostalgic throwback — when [brand] started",
    ],
  },
  {
    date: "2026-11-19",
    name: "World Toilet Day / Men's Day",
    type: "awareness_day",
    importance: "low",
    industries: ["sanitation", "wellness", "healthcare", "ngo"],
    suggestedAngles: ["Hygiene and sanitation advocacy"],
  },
  {
    date: "2026-11-25",
    name: "International Day for the Elimination of Violence Against Women",
    type: "awareness_day",
    importance: "medium",
    industries: ["ngo", "healthcare", "all"],
    suggestedAngles: ["Women safety advocacy", "Brand values stand"],
  },

  // ── DECEMBER ─────────────────────────────────────────────────────────────
  {
    date: "2026-12-01",
    name: "World AIDS Day",
    type: "awareness_day",
    importance: "medium",
    industries: ["healthcare", "ngo", "wellness"],
    suggestedAngles: ["Health awareness", "Ending stigma"],
  },
  {
    date: "2026-12-10",
    name: "Human Rights Day",
    type: "awareness_day",
    importance: "medium",
    industries: ["ngo", "education", "social_enterprise"],
    suggestedAngles: ["Brand values on equity and rights"],
  },
  {
    date: "2026-12-19",
    name: "Goa Liberation Day",
    type: "national_day",
    importance: "low",
    industries: ["travel", "hospitality"],
    suggestedAngles: ["Celebrating Goa"],
  },
  {
    date: "2026-12-24",
    name: "Christmas Eve",
    type: "festival",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Christmas wishes — warmth and joy",
      "Year-end sale/offer",
      "Team Christmas celebration BTS",
    ],
  },
  {
    date: "2026-12-25",
    name: "Christmas Day",
    type: "festival",
    importance: "high",
    industries: ["all"],
    suggestedAngles: ["Merry Christmas from [brand]", "Gift of [product/service] this Christmas"],
  },
  {
    date: "2026-12-31",
    name: "New Year's Eve",
    type: "trending",
    importance: "high",
    industries: ["all"],
    suggestedAngles: [
      "Year in review — milestones of 2026",
      "Cheers to 2027 — what's coming",
      "New Year's Eve special",
    ],
  },
];

/**
 * Get festive events for a specific month.
 */
export function getEventsForMonth(year: number, month: number): FestiveEvent[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return FESTIVE_CALENDAR_2026.filter((e) => e.date.startsWith(prefix));
}

/**
 * Format events as a string for injection into the AI prompt.
 */
export function formatEventsForPrompt(events: FestiveEvent[]): string {
  if (events.length === 0) return "No major festive events this month.";

  return events
    .map(
      (e) =>
        `• ${e.date} — ${e.name} [${e.importance} importance]\n  Suggested angles: ${e.suggestedAngles.slice(0, 2).join(" | ")}`
    )
    .join("\n");
}
