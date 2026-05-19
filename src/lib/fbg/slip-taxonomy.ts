import { SLIP_THEME_RULES } from "@/lib/fbg/verse-match-catalog";

const KEYWORD_RULES: Array<{ pattern: RegExp; category: string }> = [
  { pattern: /\b(fajr|dhuhr|asr|maghrib|isha|salah|salaah|prayer|prayed|missed prayer)\b/i, category: "Prayer Consistency" },
  { pattern: /\b(anger|angry|temper|rage|shout|yell|furious)\b/i, category: "Anger" },
  { pattern: /\b(gossip|backbit|slander|rumor|rumour|talked about)\b/i, category: "Speech" },
  { pattern: /\b(lie|lied|lying|deceiv|dishonest)\b/i, category: "Honesty" },
  { pattern: /\b(lust|desire|looked|gaze|inappropriate)\b/i, category: "Lower Gaze" },
  { pattern: /\b(waste|time|scroll|phone|social media|distract)\b/i, category: "Mindful Time" },
  { pattern: /\b(envy|jealous|resent)\b/i, category: "Contentment" },
  { pattern: /\b(ingrat|ungrateful|complain)\b/i, category: "Gratitude" },
  { pattern: /\b(parent|mother|father|disrespect)\b/i, category: "Family" },
  { pattern: /\b(food|eat|fast|hunger)\b/i, category: "Self-Discipline" },
];

export const DEFAULT_CATEGORY = "Reflection";

export const SUGGESTION_CHIPS = [
  "Missed Fajr",
  "Lost my temper",
  "Wasted time scrolling",
  "Spoke harshly",
  "Felt distant from Allah",
];

export const extractCategory = (text: string): string => {
  const normalized = text.trim();
  if (!normalized) {
    return DEFAULT_CATEGORY;
  }

  for (const rule of SLIP_THEME_RULES) {
    if (rule.pattern.test(normalized)) {
      return rule.category;
    }
  }

  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(normalized)) {
      return rule.category;
    }
  }

  return DEFAULT_CATEGORY;
};

export const getTaxonomyChips = (recentCategories: string[] = []): string[] => {
  const merged = [...recentCategories, ...SUGGESTION_CHIPS];
  return Array.from(new Set(merged)).slice(0, 8);
};

export const simulateExtractionDelay = (ms = 300): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
