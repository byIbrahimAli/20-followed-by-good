import { describe, expect, it } from "vitest";

import { detectMixedQfEnvironment, normalizeContentBaseUrl } from "@/lib/env";

describe("normalizeContentBaseUrl", () => {
  it("appends /content when the gateway root is provided", () => {
    expect(normalizeContentBaseUrl("https://apis-prelive.quran.foundation")).toBe(
      "https://apis-prelive.quran.foundation/content",
    );
  });

  it("leaves URLs that already end with /content unchanged", () => {
    expect(normalizeContentBaseUrl("https://apis.quran.foundation/content/")).toBe(
      "https://apis.quran.foundation/content",
    );
  });

  it("returns undefined for empty input", () => {
    expect(normalizeContentBaseUrl(undefined)).toBeUndefined();
  });
});

describe("detectMixedQfEnvironment", () => {
  it("warns when prelive OAuth is paired with production gateway", () => {
    expect(
      detectMixedQfEnvironment("https://prelive-oauth2.quran.foundation", {
        gatewayUrl: "https://apis.quran.foundation",
      }),
    ).toContain("Mixed Quran Foundation");
  });

  it("allows consistent production hosts", () => {
    expect(
      detectMixedQfEnvironment("https://oauth2.quran.foundation", {
        gatewayUrl: "https://apis.quran.foundation",
      }),
    ).toBeNull();
  });

  it("allows consistent prelive hosts", () => {
    expect(
      detectMixedQfEnvironment("https://prelive-oauth2.quran.foundation", {
        gatewayUrl: "https://apis-prelive.quran.foundation",
      }),
    ).toBeNull();
  });
});
