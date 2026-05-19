import { getCategoryQuery } from "@/lib/fbg/category-queries";
import { getThematicSearchPhrase } from "@/lib/fbg/verse-match-catalog";

const FILLER_PATTERN =
  /\b(i|me|my|mine|we|our|you|your|today|yesterday|just|really|very|was|were|am|is|are|be|been|being|the|a|an|and|but|so|because|when|then|again|also|too|not|don't|didn't|can't|won't|have|had|has|that|this|it|its|at|in|on|for|to|of|with)\b/gi;

const MAX_QUERY_LENGTH = 120;

/** Normalize slip text into searchable tokens (min length 3). */
export const tokenizeForMatch = (text: string): string[] => {
  const normalized = text.toLowerCase().replace(/[^\w\s'-]/g, " ");
  const tokens = normalized.match(/\b[\w'-]{3,}\b/g) ?? [];
  return Array.from(new Set(tokens));
};

/** Strip conversational filler so Search gets thematic words from the slip. */
export const cleanSlipForSearch = (slipText: string): string =>
  slipText
    .replace(FILLER_PATTERN, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Build ordered search queries: slip-first, slip+category blend, then category phrase.
 */
export const buildSearchQueries = (slipText: string, category: string): string[] => {
  const categoryQuery = getThematicSearchPhrase(
    slipText,
    category,
    getCategoryQuery,
  ).trim();
  const cleaned = cleanSlipForSearch(slipText.trim());
  const queries: string[] = [];

  if (cleaned.length >= 8) {
    queries.push(cleaned.slice(0, MAX_QUERY_LENGTH));
  } else if (cleaned.length >= 3) {
    queries.push(cleaned);
  }

  if (cleaned.length >= 3 && categoryQuery) {
    const slipKeywords = tokenizeForMatch(cleaned).slice(0, 8);
    if (slipKeywords.length > 0) {
      queries.push(
        `${categoryQuery} ${slipKeywords.join(" ")}`.slice(0, MAX_QUERY_LENGTH),
      );
    }
  }

  if (categoryQuery) {
    queries.push(categoryQuery);
  }

  return Array.from(new Set(queries.map((query) => query.trim()).filter(Boolean)));
};

export const shouldUseAdvancedSearch = (slipText: string): boolean =>
  cleanSlipForSearch(slipText).length > 80;
