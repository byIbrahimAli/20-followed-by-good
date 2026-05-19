import { describe, expect, it } from "vitest";

import { isLikelyIncompleteVerse } from "@/lib/fbg/hydrate-assignment-verse";

describe("isLikelyIncompleteVerse", () => {
  it("flags single-word snippets", () => {
    expect(isLikelyIncompleteVerse("وَالْعَصْرِ")).toBe(true);
  });

  it("accepts multi-word ayahs", () => {
    expect(
      isLikelyIncompleteVerse(
        "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ",
      ),
    ).toBe(false);
  });
});
