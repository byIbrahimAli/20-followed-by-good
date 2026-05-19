#!/usr/bin/env node

const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const normalizeAppBaseUrl = (url) => {
  const trimmed = url.trim().replace(/\/$/, "");
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

/** Mirrors src/lib/resolve-app-base-url.ts */
const resolveAppBaseUrl = () => {
  const explicit = process.env.APP_BASE_URL?.trim();
  if (explicit) {
    return normalizeAppBaseUrl(explicit);
  }

  const vercelEnv = process.env.VERCEL_ENV;
  const vercelUrl = process.env.VERCEL_URL?.trim();

  if (vercelEnv === "production") {
    const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
    if (productionHost) {
      return normalizeAppBaseUrl(productionHost);
    }
    if (vercelUrl) {
      return normalizeAppBaseUrl(vercelUrl);
    }
    return undefined;
  }

  if (
    vercelUrl &&
    (vercelEnv === "preview" ||
      vercelEnv === "development" ||
      vercelEnv === undefined)
  ) {
    return normalizeAppBaseUrl(vercelUrl);
  }

  return undefined;
};

const requiredKeys = ["CLIENT_ID", "CLIENT_SECRET", "SESSION_SECRET"];

const starterDefaults = {
  APP_BASE_URL: "http://localhost:3000",
  CLIENT_ID: "local_confidential_client_id",
  CLIENT_SECRET: "local_confidential_client_secret",
  SESSION_SECRET: "local_dev_only_secret_change_me",
};

const smokeEnv = {
  APP_BASE_URL: resolveAppBaseUrl() || starterDefaults.APP_BASE_URL,
  CLIENT_ID: process.env.CLIENT_ID || starterDefaults.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET || starterDefaults.CLIENT_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET || starterDefaults.SESSION_SECRET,
  TRANSLATION_IDS: process.env.TRANSLATION_IDS,
};

const missing = requiredKeys.filter((key) => !smokeEnv[key]);

if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const parseTranslationIds = (value) => {
  if (!value) {
    return [131];
  }

  const parsed = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number.parseInt(item, 10))
    .filter((item) => Number.isInteger(item) && item > 0);

  return parsed.length ? parsed : [131];
};

const translationIds = parseTranslationIds(smokeEnv.TRANSLATION_IDS);

if (!translationIds.length) {
  console.error("TRANSLATION_IDS must resolve to at least one numeric ID.");
  process.exit(1);
}

const run = async () => {
  try {
    const publicSdk = await import("@quranjs/api/public");
    const serverSdk = await import("@quranjs/api/server");

    const mockFetch = async () =>
      new Response("{}", {
        headers: { "content-type": "application/json" },
        status: 200,
      });

    const storage = {
      clearSession: () => undefined,
      getSession: () => null,
      setSession: () => undefined,
    };

    publicSdk.createPublicClient({
      clientId: smokeEnv.CLIENT_ID,
      clientType: "confidential-proxy",
      fetch: mockFetch,
      storage,
    });

    serverSdk.createServerClient({
      clientId: smokeEnv.CLIENT_ID,
      clientSecret: smokeEnv.CLIENT_SECRET,
      fetch: mockFetch,
      storage,
      userSession: null,
    });

    console.log("Smoke config check passed.");
    console.log(`- translation IDs: ${translationIds.join(", ")}`);
    console.log("- runtime-split SDK entrypoints are available");
  } catch (error) {
    console.error("Failed to initialize runtime-split SDK clients.");
    console.error(String(error?.message || error));
    process.exit(1);
  }
};

run();
