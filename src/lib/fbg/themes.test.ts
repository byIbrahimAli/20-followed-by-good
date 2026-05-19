import { describe, expect, it } from "vitest";

import { FBG_THEME_IDS, isFbgThemeId } from "@/lib/fbg/themes";

describe("fbg themes", () => {
  it("includes default and design themes", () => {
    expect(FBG_THEME_IDS).toContain("default");
    expect(FBG_THEME_IDS).toContain("warm-light");
    expect(FBG_THEME_IDS).toContain("serenity-dark");
  });

  it("validates theme ids", () => {
    expect(isFbgThemeId("warm-dark")).toBe(true);
    expect(isFbgThemeId("invalid")).toBe(false);
  });
});
