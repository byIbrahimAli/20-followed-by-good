import { describe, expect, it } from "vitest";

import { compareRecall } from "@/lib/fbg/compare-recall";
import { normalizeArabic } from "@/lib/fbg/normalize-arabic";

describe("normalizeArabic", () => {
  it("removes diacritics and normalizes alef", () => {
    expect(normalizeArabic("قُلْ يَا عِبَادِي")).toBe("قل يا عبادي");
  });
});

describe("compareRecall with Arabic", () => {
  it("matches normalized Arabic tokens", () => {
    const result = compareRecall(
      "قُلْ يَا عِبَادِي",
      "قل يا عبادي",
      normalizeArabic,
    );
    expect(result.matchCount).toBe(3);
    expect(result.coveragePercent).toBe(100);
  });
});
