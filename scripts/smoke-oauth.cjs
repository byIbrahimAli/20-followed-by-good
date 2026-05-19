#!/usr/bin/env node

/**
 * Verifies Quran Foundation OAuth2 client_credentials + Content API access.
 * See: https://api-docs.quran.foundation/docs/quickstart/
 */

const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const PRODUCTION_OAUTH = "https://oauth2.quran.foundation";
const PRODUCTION_GATEWAY = "https://apis.quran.foundation";
const PRELIVE_OAUTH = "https://prelive-oauth2.quran.foundation";
const PRELIVE_GATEWAY = "https://apis-prelive.quran.foundation";

const required = ["CLIENT_ID", "CLIENT_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  console.error("Set them in .env.local (see .env.example).");
  process.exit(1);
}

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const oauthBase = (
  process.env.OAUTH2_BASE_URL ??
  process.env.TOKEN_HOST ??
  PRODUCTION_OAUTH
).replace(/\/$/, "");
const gateway = (process.env.GATEWAY_URL ?? PRODUCTION_GATEWAY).replace(/\/$/, "");

const isPreliveHost = (url) => url.includes("prelive");
const oauthIsPrelive = isPreliveHost(oauthBase);
const gatewayIsPrelive = isPreliveHost(gateway);

if (oauthIsPrelive !== gatewayIsPrelive) {
  console.error("Mixed Quran Foundation environment detected:");
  console.error(`- OAuth host: ${oauthBase} (${oauthIsPrelive ? "prelive" : "production"})`);
  console.error(`- API gateway: ${gateway} (${gatewayIsPrelive ? "prelive" : "production"})`);
  console.error("Use matching prelive or production hosts for both (see .env.example).");
  process.exit(1);
}

const encodeBasicAuth = (id, secret) =>
  Buffer.from(`${id}:${secret}`).toString("base64");

const fetchToken = async () => {
  const response = await fetch(`${oauthBase}/oauth2/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${encodeBasicAuth(clientId, clientSecret)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "content",
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail =
      body.error_description ?? body.error ?? `${response.status} ${response.statusText}`;
    throw new Error(`Token exchange failed: ${detail}`);
  }

  if (!body.access_token) {
    throw new Error("Token response did not include access_token.");
  }

  return body.access_token;
};

const contentFetch = async (accessToken, path) => {
  const url = `${gateway}${path.startsWith("/") ? path : `/${path}`}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "x-auth-token": accessToken,
      "x-client-id": clientId,
    },
  });

  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  return { ok: response.ok, status: response.status, body };
};

const run = async () => {
  const envLabel = oauthIsPrelive ? "prelive" : "production";
  console.log(`Quran Foundation OAuth smoke (${envLabel})`);
  console.log(`- token: ${oauthBase}/oauth2/token`);
  console.log(`- api:   ${gateway}`);

  const accessToken = await fetchToken();
  console.log("✓ client_credentials token (scope=content)");

  const chapters = await contentFetch(accessToken, "/content/api/v4/chapters");
  if (!chapters.ok) {
    const msg =
      typeof chapters.body === "object" && chapters.body?.message
        ? chapters.body.message
        : `HTTP ${chapters.status}`;
    throw new Error(`Chapters request failed: ${msg}`);
  }

  const chapterCount = Array.isArray(chapters.body?.chapters)
    ? chapters.body.chapters.length
    : "?";
  console.log(`✓ GET /content/api/v4/chapters (${chapterCount} chapters)`);

  const audio = await contentFetch(
    accessToken,
    "/content/api/v4/recitations/7/by_ayah/1:1",
  );
  if (!audio.ok) {
    const msg =
      typeof audio.body === "object" && audio.body?.message
        ? audio.body.message
        : `HTTP ${audio.status}`;
    console.warn(`⚠ Audio probe failed (assign Listen may still fail): ${msg}`);
  } else {
    const files = audio.body?.audio_files ?? audio.body?.audioFiles ?? [];
    const first = files[0];
    const url = first?.audioUrl ?? first?.url ?? "(no file)";
    console.log(`✓ GET /content/api/v4/recitations/7/by_ayah/1:1 → ${url}`);
  }

  console.log("\nSmoke OAuth passed. Restart dev server if it was already running.");
};

run().catch((error) => {
  console.error(`\nSmoke OAuth failed: ${error.message}`);
  process.exit(1);
});
