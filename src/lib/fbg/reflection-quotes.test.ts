import { describe, expect, it, vi } from "vitest";

import {
  REFLECTION_QUOTES,
  pickRandomQuote,
} from "@/lib/fbg/reflection-quotes";

describe("REFLECTION_QUOTES", () => {
  it("contains 10 quotes with ids and bodies", () => {
    expect(REFLECTION_QUOTES).toHaveLength(10);
    for (const quote of REFLECTION_QUOTES) {
      expect(quote.id).toBeTruthy();
      expect(quote.title).toBeTruthy();
      expect(quote.body.length).toBeGreaterThan(20);
    }
  });

  it("includes the best-manner supplication quote", () => {
    const quote = REFLECTION_QUOTES.find((item) => item.id === "best-manner");
    expect(quote?.body).toMatch(/O Allah, You are my Lord/);
    expect(quote?.body).toMatch(/Bukhārī 6306/);
  });
});

describe("pickRandomQuote", () => {
  it("returns a quote from the pool", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const quote = pickRandomQuote();
    expect(REFLECTION_QUOTES).toContainEqual(quote);
    vi.restoreAllMocks();
  });
});
