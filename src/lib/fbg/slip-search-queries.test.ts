import { describe, expect, it } from "vitest";

import {
  buildSearchQueries,
  cleanSlipForSearch,
  shouldUseAdvancedSearch,
  tokenizeForMatch,
} from "@/lib/fbg/slip-search-queries";

describe("slip-search-queries", () => {
  it("strips filler words from slips", () => {
    expect(cleanSlipForSearch("I really lost my temper today at work")).toBe(
      "lost temper work",
    );
  });

  it("builds slip-first then blended then category queries", () => {
    const queries = buildSearchQueries(
      "I yelled at my kids after losing my temper",
      "Anger",
    );

    expect(queries[0]).toContain("yell");
    expect(queries.some((query) => query.includes("restrain anger"))).toBe(true);
    expect(new Set(queries).size).toBe(queries.length);
  });

  it("tokenizes for overlap scoring", () => {
    expect(tokenizeForMatch("anger, angry!!!")).toEqual(
      expect.arrayContaining(["anger", "angry"]),
    );
  });

  it("suggests advanced search for long slips", () => {
    const longSlip =
      "Today I spent nearly three hours scrolling social media instead of praying or reading Quran and I feel ashamed about how much time I wasted.";
    expect(shouldUseAdvancedSearch(longSlip)).toBe(true);
    expect(shouldUseAdvancedSearch("Missed Fajr")).toBe(false);
  });
});
