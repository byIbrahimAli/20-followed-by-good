import "server-only";

import { getCategoryQuery, getFallbackVerseKey } from "@/lib/fbg/category-queries";
import {
  buildSearchQueries,
  cleanSlipForSearch,
  shouldUseAdvancedSearch,
  tokenizeForMatch,
} from "@/lib/fbg/slip-search-queries";
import { resolveVerseLocally } from "@/lib/fbg/resolve-verse-locally";
import { loadSearchData, parseVerseKey } from "@/lib/data";
import type { SearchItem } from "@/lib/types";
import type { StoredSession } from "@/lib/session/store";

const VERSE_RESULT_LIMIT = 5;
/** Minimum token-overlap score to prefer search over local catalog. */
export const MIN_VERSE_MATCH_SCORE = 2;

export type VerseMatchSource =
  | "search-slip"
  | "search-category"
  | "search-ranked"
  | "local"
  | "fallback";

export interface ResolvedVerseKey {
  matchSource: VerseMatchSource;
  searchQuery?: string;
  verseKey: string;
}

const scoreVerseCandidate = (
  slipTokens: string[],
  categoryTokens: string[],
  item: SearchItem,
): number => {
  const snippet = `${item.text ?? ""} ${item.subtitle ?? ""}`.toLowerCase();
  if (!snippet.trim() && !item.verseKey) {
    return 0;
  }

  let score = 0;

  for (const token of slipTokens) {
    if (snippet.includes(token)) {
      score += 2;
    }
  }

  for (const token of categoryTokens) {
    if (snippet.includes(token)) {
      score += 1;
    }
  }

  return score;
};

const pickBestFromResults = (
  items: SearchItem[],
  slipTokens: string[],
  categoryTokens: string[],
): { item: SearchItem; score: number } | null => {
  let best: { item: SearchItem; score: number } | null = null;

  for (const item of items) {
    const verseKey = parseVerseKey(item.verseKey);
    if (!verseKey) {
      continue;
    }

    const score = scoreVerseCandidate(slipTokens, categoryTokens, item);
    if (!best || score > best.score) {
      best = { item: { ...item, verseKey }, score };
    }
  }

  return best;
};

const firstValidVerse = (items: SearchItem[]): SearchItem | null => {
  for (const item of items) {
    const verseKey = parseVerseKey(item.verseKey);
    if (verseKey) {
      return { ...item, verseKey };
    }
  }

  return null;
};

const classifyMatchSource = (
  query: string,
  slipText: string,
  category: string,
): VerseMatchSource => {
  const categoryQuery = getCategoryQuery(category).trim();
  const cleanedSlip = cleanSlipForSearch(slipText);

  if (query === categoryQuery) {
    return "search-category";
  }

  if (cleanedSlip && query.startsWith(cleanedSlip.slice(0, 20))) {
    return "search-slip";
  }

  if (cleanedSlip && query.includes(cleanedSlip.slice(0, Math.min(24, cleanedSlip.length)))) {
    return "search-slip";
  }

  return "search-category";
};

const isSlipLedQuery = (query: string, slipText: string, category: string): boolean =>
  classifyMatchSource(query, slipText, category) !== "search-category";

/**
 * Resolve the best verse key for a slip using QF Search when available, else local catalog.
 */
export const resolveVerseFromSlip = async (
  session: StoredSession,
  slipText: string,
  category: string,
): Promise<ResolvedVerseKey> => {
  const queries = buildSearchQueries(slipText, category);
  const slipTokens = tokenizeForMatch(cleanSlipForSearch(slipText));
  const categoryTokens = tokenizeForMatch(getCategoryQuery(category));
  const useAdvanced = shouldUseAdvancedSearch(slipText);
  const localMatch = resolveVerseLocally(slipText, category);

  let bestOverall: {
    item: SearchItem;
    query: string;
    score: number;
    source: VerseMatchSource;
  } | null = null;

  let topRankedFromSlipSearch: { item: SearchItem; query: string } | null = null;
  let searchSucceeded = false;

  for (const query of queries) {
    const search = await loadSearchData(session, query, {
      getText: true,
      useAdvanced,
      versesResultsNumber: VERSE_RESULT_LIMIT,
    });

    if (search.error) {
      continue;
    }

    searchSucceeded = true;

    if (!topRankedFromSlipSearch && isSlipLedQuery(query, slipText, category)) {
      const ranked = firstValidVerse(search.verseItems);
      if (ranked) {
        topRankedFromSlipSearch = { item: ranked, query };
      }
    }

    const pick = pickBestFromResults(search.verseItems, slipTokens, categoryTokens);
    if (!pick) {
      continue;
    }

    const source = classifyMatchSource(query, slipText, category);
    if (!bestOverall || pick.score > bestOverall.score) {
      bestOverall = {
        item: pick.item,
        query,
        score: pick.score,
        source,
      };
    }

    if (pick.score >= MIN_VERSE_MATCH_SCORE + 2) {
      break;
    }
  }

  if (bestOverall && bestOverall.score >= MIN_VERSE_MATCH_SCORE) {
    const verseKey = parseVerseKey(bestOverall.item.verseKey);
    if (verseKey) {
      return {
        matchSource: bestOverall.source,
        searchQuery: bestOverall.query,
        verseKey,
      };
    }
  }

  if (searchSucceeded && topRankedFromSlipSearch) {
    const verseKey = parseVerseKey(topRankedFromSlipSearch.item.verseKey);
    if (verseKey) {
      return {
        matchSource: "search-ranked",
        searchQuery: topRankedFromSlipSearch.query,
        verseKey,
      };
    }
  }

  if (localMatch.verseKey) {
    return {
      matchSource: searchSucceeded ? "local" : "local",
      searchQuery: localMatch.searchPhrase,
      verseKey: localMatch.verseKey,
    };
  }

  return {
    matchSource: "fallback",
    verseKey: getFallbackVerseKey(category),
  };
};
