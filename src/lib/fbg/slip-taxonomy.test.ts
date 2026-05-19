import { describe, expect, it } from "vitest";

import { extractCategory, getTaxonomyChips } from "./slip-taxonomy";

describe("slip-taxonomy", () => {
  it("maps prayer keywords to Prayer Consistency", () => {
    expect(extractCategory("I missed fajr again")).toBe("Prayer Consistency");
  });

  it("maps anger keywords to Anger", () => {
    expect(extractCategory("I lost my temper at work")).toBe("Anger");
  });

  it("dedupes taxonomy chips", () => {
    const chips = getTaxonomyChips(["Anger", "Anger"]);
    expect(chips.length).toBeLessThanOrEqual(8);
    expect(new Set(chips).size).toBe(chips.length);
  });

  it("includes error-style chips for temper slips", () => {
    const chips = getTaxonomyChips([]);
    expect(chips).toContain("Lost my temper");
  });

  it("maps gossip keywords to Speech category", () => {
    expect(extractCategory("I gossip about my friend")).toBe("Speech");
  });

  it("maps explicit content slips to Lower Gaze", () => {
    expect(extractCategory("porn")).toBe("Lower Gaze");
  });

  it("maps animal harm slips to Kindness", () => {
    expect(extractCategory("I shaved a cat")).toBe("Kindness");
  });
});
