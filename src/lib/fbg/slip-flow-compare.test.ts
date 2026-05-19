import { describe, expect, it } from "vitest";

import { getCategoryQuery, getFallbackVerseKey } from "@/lib/fbg/category-queries";
import { buildSearchQueries, cleanSlipForSearch } from "@/lib/fbg/slip-search-queries";
import { resolveVerseLocally } from "@/lib/fbg/resolve-verse-locally";
import { extractCategory } from "@/lib/fbg/slip-taxonomy";

const SLIPS = [
  "I accidently cursed someone behind their back",
  "I overate",
];

describe("slip flow comparison (documentation)", () => {
  it.each(SLIPS)("maps %s through current pipeline", (slip) => {
    const category = extractCategory(slip);
    const queries = buildSearchQueries(slip, category);
    const local = resolveVerseLocally(slip, category);

    // Log for manual inspection when running vitest
    console.log("\n---");
    console.log("slip:", slip);
    console.log("category:", category);
    console.log("cleaned:", cleanSlipForSearch(slip));
    console.log("app search queries:", queries);
    console.log("direct slip search would be:", slip);
    console.log("local verse:", local.verseKey, "| phrase:", local.searchPhrase);
    console.log("category fallback:", getFallbackVerseKey(category));
    console.log("category search phrase:", getCategoryQuery(category));

    expect(category).toBeTruthy();
    expect(queries.length).toBeGreaterThan(0);
    expect(local.verseKey).toMatch(/^\d+:\d+$/);
  });
});
