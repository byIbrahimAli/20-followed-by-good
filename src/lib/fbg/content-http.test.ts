import { afterEach, describe, expect, it, vi } from "vitest";

import { ensureHttpsOrigin } from "@/lib/resolve-app-base-url";

describe("ensureHttpsOrigin", () => {
  it("adds https when the gateway host has no scheme", () => {
    expect(ensureHttpsOrigin("apis.quran.foundation")).toBe(
      "https://apis.quran.foundation",
    );
  });

  it("leaves fully qualified URLs unchanged", () => {
    expect(ensureHttpsOrigin("https://apis.quran.foundation/")).toBe(
      "https://apis.quran.foundation",
    );
  });
});

describe("resolveContentGatewayRoot", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("normalizes GATEWAY_URL without a scheme", async () => {
    vi.stubEnv("GATEWAY_URL", "apis.quran.foundation");
    vi.stubEnv("CLIENT_ID", "test-client");
    vi.stubEnv("CLIENT_SECRET", "test-secret");
    vi.stubEnv("SESSION_SECRET", "test-session-secret");
    vi.stubEnv("APP_BASE_URL", "http://localhost:3000");

    const { resolveContentGatewayRoot } = await import("@/lib/fbg/content-http");
    expect(resolveContentGatewayRoot()).toBe("https://apis.quran.foundation");
  });
});
