import { getCategoryQuery, getFallbackVerseKey } from "@/lib/fbg/category-queries";
import { tokenizeForMatch } from "@/lib/fbg/slip-search-queries";
import { extractCategory } from "@/lib/fbg/slip-taxonomy";
import {
  CATEGORY_VERSE_CANDIDATES,
  getThematicSearchPhrase,
  SLIP_THEME_RULES,
  VERSE_THEME_GLOSS,
} from "@/lib/fbg/verse-match-catalog";

export interface LocalVerseMatch {
  category: string;
  searchPhrase: string;
  verseKey: string;
}

/** Map colloquial slip words to thematic tokens used in verse glosses. */
const SLIP_TOKEN_ALIASES: Record<string, string[]> = {
  cat: ["animal", "animals", "cattle", "creation", "beasts"],
  cats: ["animal", "animals", "cattle", "creation", "beasts"],
  dog: ["animal", "animals", "cattle", "creation", "beasts"],
  dogs: ["animal", "animals", "cattle", "creation", "beasts"],
  pet: ["animal", "animals", "creation"],
  pets: ["animal", "animals", "creation"],
  porn: ["chastity", "gaze", "private", "parts", "immorality", "adultery"],
  shaved: ["wrong", "harm", "creation"],
  killed: ["wrong", "harm", "justice"],
  abuse: ["wrong", "harm", "justice"],
};

const expandTokens = (tokens: string[]): string[] => {
  const expanded = new Set(tokens);

  for (const token of tokens) {
    for (const alias of SLIP_TOKEN_ALIASES[token] ?? []) {
      expanded.add(alias);
    }
  }

  return Array.from(expanded);
};

const scoreGloss = (tokens: string[], gloss: string): number => {
  const haystack = gloss.toLowerCase();
  let score = 0;

  for (const token of tokens) {
    if (haystack.includes(token)) {
      score += 2;
    }
  }

  return score;
};

const resolveSlipTheme = (
  slipText: string,
  category: string,
): { category: string; searchPhrase: string } => {
  for (const rule of SLIP_THEME_RULES) {
    if (rule.pattern.test(slipText)) {
      return { category: rule.category, searchPhrase: rule.searchPhrase };
    }
  }

  return {
    category,
    searchPhrase: getThematicSearchPhrase(slipText, category, getCategoryQuery),
  };
};

/**
 * Pick the best verse from curated glosses when Search is unavailable or low-confidence.
 */
export const resolveVerseLocally = (
  slipText: string,
  categoryHint?: string,
): LocalVerseMatch => {
  const category = categoryHint ?? extractCategory(slipText);
  const theme = resolveSlipTheme(slipText, category);
  const tokens = tokenizeForMatch(slipText);
  const categoryTokens = tokenizeForMatch(theme.searchPhrase);
  const combinedTokens = expandTokens(
    Array.from(new Set([...tokens, ...categoryTokens])),
  );

  const candidates =
    CATEGORY_VERSE_CANDIDATES[theme.category] ??
    CATEGORY_VERSE_CANDIDATES.Reflection;

  let bestKey = getFallbackVerseKey(theme.category);
  let bestScore = -1;

  for (const verseKey of candidates) {
    const gloss = VERSE_THEME_GLOSS[verseKey];
    if (!gloss) {
      continue;
    }

    const score = scoreGloss(combinedTokens, gloss);
    if (score > bestScore) {
      bestScore = score;
      bestKey = verseKey;
    }
  }

  if (bestScore <= 0 && tokens.length > 0) {
    const reflectionCandidates = CATEGORY_VERSE_CANDIDATES.Reflection;
    for (const verseKey of reflectionCandidates) {
      const gloss = VERSE_THEME_GLOSS[verseKey];
      if (!gloss) {
        continue;
      }
      const score = scoreGloss(tokens, gloss);
      if (score > bestScore) {
        bestScore = score;
        bestKey = verseKey;
      }
    }
  }

  return {
    category: theme.category,
    searchPhrase: theme.searchPhrase,
    verseKey: bestKey,
  };
};
