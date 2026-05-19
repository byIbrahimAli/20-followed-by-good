import { describe, expect, it } from "vitest";

import { extractVerseArabicText } from "@/lib/data";

describe("extractVerseArabicText", () => {
  it("returns verse-level textUthmani when present", () => {
    expect(
      extractVerseArabicText({
        textUthmani: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      }),
    ).toBe("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ");
  });

  it("joins words when verse-level text is a single token", () => {
    expect(
      extractVerseArabicText({
        textUthmani: "قُلْ",
        words: [
          { textUthmani: "قُلْ" },
          { textUthmani: "يَا" },
          { textUthmani: "عِبَادِي" },
        ],
      }),
    ).toBe("قُلْ يَا عِبَادِي");
  });
});
