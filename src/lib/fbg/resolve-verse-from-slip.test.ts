import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadSearchData: vi.fn(),
}));

vi.mock("@/lib/data", () => ({
  loadSearchData: mocks.loadSearchData,
  parseVerseKey: (key: string | null | undefined) =>
    /^\d+:\d+$/.test(String(key ?? "")) ? String(key) : null,
}));

import {
  MIN_VERSE_MATCH_SCORE,
  resolveVerseFromSlip,
} from "@/lib/fbg/resolve-verse-from-slip";

describe("resolveVerseFromSlip", () => {
  beforeEach(() => {
    mocks.loadSearchData.mockReset();
  });

  it("picks the highest-scoring verse from search results", async () => {
    mocks.loadSearchData.mockImplementation(async (_session, query: string) => {
      if (query.includes("lost") || query.includes("temper")) {
        return {
          error: null,
          navigationItems: [],
          query,
          verseItems: [
            {
              text: "by time humanity is surely in loss",
              verseKey: "103:1",
            },
            {
              text: "do not let anger overcome you when you lose temper",
              verseKey: "42:43",
            },
          ],
        };
      }

      return {
        error: null,
        navigationItems: [],
        query,
        verseItems: [{ text: "generic believers", verseKey: "1:1" }],
      };
    });

    const result = await resolveVerseFromSlip(
      {} as never,
      "I lost my temper and shouted",
      "Anger",
    );

    expect(result.verseKey).toBe("42:43");
    expect(result.matchSource).toMatch(/search-/);
  });

  it("uses local catalog when search is unavailable", async () => {
    mocks.loadSearchData.mockResolvedValue({
      error: "403 insufficient_scope",
      navigationItems: [],
      query: "test",
      verseItems: [],
    });

    const result = await resolveVerseFromSlip({} as never, "porn", "Lower Gaze");

    expect(result.matchSource).toBe("local");
    expect(["24:30", "24:31", "23:5", "17:32", "70:29", "12:23"]).toContain(
      result.verseKey,
    );
  });

  it("trusts search ranking when overlap score is zero", async () => {
    mocks.loadSearchData.mockImplementation(async (_session, query: string) => ({
      error: null,
      navigationItems: [],
      query,
      verseItems: [
        {
          text: "semantic match without shared tokens",
          verseKey: "24:30",
        },
      ],
    }));

    const result = await resolveVerseFromSlip(
      {} as never,
      "porn",
      "Lower Gaze",
    );

    expect(result.matchSource).toBe("search-ranked");
    expect(result.verseKey).toBe("24:30");
  });

  it("exports a sensible minimum score threshold", () => {
    expect(MIN_VERSE_MATCH_SCORE).toBeGreaterThanOrEqual(1);
  });
});
