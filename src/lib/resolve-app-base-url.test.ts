import { afterEach, describe, expect, it, vi } from "vitest";

import {
  normalizeAppBaseUrl,
  resolveAppBaseUrl,
} from "@/lib/resolve-app-base-url";

const clearVercelEnv = () => {
  vi.unstubAllEnvs();
};

describe("normalizeAppBaseUrl", () => {
  it("strips trailing slashes", () => {
    expect(normalizeAppBaseUrl("https://example.com/")).toBe("https://example.com");
  });

  it("adds https when the host has no scheme", () => {
    expect(normalizeAppBaseUrl("my-app.vercel.app")).toBe(
      "https://my-app.vercel.app",
    );
  });
});

describe("resolveAppBaseUrl", () => {
  afterEach(() => {
    clearVercelEnv();
  });

  it("prefers explicit APP_BASE_URL", () => {
    vi.stubEnv("APP_BASE_URL", "https://custom.example/");
    vi.stubEnv("VERCEL_URL", "deployment.vercel.app");
    vi.stubEnv("VERCEL_ENV", "preview");

    expect(resolveAppBaseUrl()).toBe("https://custom.example");
  });

  it("uses VERCEL_PROJECT_PRODUCTION_URL on production when APP_BASE_URL is unset", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "my-app.vercel.app");
    vi.stubEnv("VERCEL_URL", "my-app-git-main-user.vercel.app");

    expect(resolveAppBaseUrl()).toBe("https://my-app.vercel.app");
  });

  it("uses VERCEL_URL on preview deployments", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_URL", "my-app-git-feature-user.vercel.app");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "my-app.vercel.app");

    expect(resolveAppBaseUrl()).toBe(
      "https://my-app-git-feature-user.vercel.app",
    );
  });

  it("returns undefined when no origin can be resolved", () => {
    expect(resolveAppBaseUrl()).toBeUndefined();
  });
});
