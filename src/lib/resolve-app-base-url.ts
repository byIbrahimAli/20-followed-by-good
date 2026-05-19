/**
 * Public origin for OAuth callbacks and absolute app links.
 * See docs/deploy-vercel.md.
 */

const getOptionalEnv = (key: string): string | undefined => {
  const value = process.env[key];
  return value?.trim() ? value.trim() : undefined;
};

/** Add https:// when a host or API base is missing a scheme (avoids WebKit `new URL` failures). */
export const ensureHttpsOrigin = (url: string): string => {
  const trimmed = url.trim().replace(/\/$/, "");
  if (!trimmed) {
    throw new Error("URL must not be empty.");
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

/** Strip trailing slash; add https:// when the host has no scheme (Vercel host vars). */
export const normalizeAppBaseUrl = (url: string): string => {
  const trimmed = url.trim().replace(/\/$/, "");
  if (!trimmed) {
    throw new Error("App base URL must not be empty");
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

/**
 * Resolves the app origin without throwing.
 *
 * Priority:
 * 1. `APP_BASE_URL` (custom domain or explicit override)
 * 2. Production on Vercel: `VERCEL_PROJECT_PRODUCTION_URL`, then `VERCEL_URL`
 * 3. Preview / development on Vercel: `VERCEL_URL` only (not production URL)
 */
export const resolveAppBaseUrl = (): string | undefined => {
  const explicit = getOptionalEnv("APP_BASE_URL");
  if (explicit) {
    return normalizeAppBaseUrl(explicit);
  }

  const vercelEnv = process.env.VERCEL_ENV;
  const vercelUrl = getOptionalEnv("VERCEL_URL");

  if (vercelEnv === "production") {
    const productionHost = getOptionalEnv("VERCEL_PROJECT_PRODUCTION_URL");
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

export const requireAppBaseUrl = (): string => {
  const resolved = resolveAppBaseUrl();
  if (resolved) {
    return resolved;
  }

  throw new Error(
    "Missing app base URL: set APP_BASE_URL, or deploy on Vercel " +
      "(VERCEL_URL / VERCEL_PROJECT_PRODUCTION_URL are used automatically).",
  );
};
