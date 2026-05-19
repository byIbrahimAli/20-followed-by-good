import { describe, expect, it } from "vitest";

import { extractCategory } from "@/lib/fbg/slip-taxonomy";
import { resolveVerseLocally } from "@/lib/fbg/resolve-verse-locally";

describe("resolveVerseLocally", () => {
  it("maps explicit slips to chastity verses", () => {
    expect(extractCategory("porn")).toBe("Lower Gaze");

    const match = resolveVerseLocally("porn", "Lower Gaze");
    expect(["24:30", "24:31", "23:5", "17:32", "70:29", "12:23"]).toContain(
      match.verseKey,
    );
  });

  it("maps animal harm slips to kindness or creation verses", () => {
    expect(extractCategory("I shaved a cat")).toBe("Kindness");

    const match = resolveVerseLocally("I shaved a cat", "Kindness");
    expect(["6:38", "16:5", "6:141", "55:10", "17:44", "21:47"]).toContain(
      match.verseKey,
    );
  });
});
