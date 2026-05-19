import { DEFAULT_OAUTH2_BASE_URL } from "@/lib/oauth";

const REQUIRED_ENV_VARS = [
  "APP_BASE_URL",
  "CLIENT_ID",
  "CLIENT_SECRET",
  "SESSION_SECRET",
] as const;

const getRequired = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const getOptional = (key: string): string | undefined => {
  const value = process.env[key];
  return value ? value : undefined;
};

const toPositiveInt = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

export const parseTranslationIds = (value: string | undefined): number[] => {
  if (!value) {
    return [131];
  }

  const parsed = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number.parseInt(item, 10))
    .filter((item) => Number.isInteger(item) && item > 0);

  return parsed.length > 0 ? parsed : [131];
};

/** @quranjs/api expects the content service host to include a `/content` suffix. */
export const normalizeContentBaseUrl = (url?: string): string | undefined => {
  if (!url) {
    return undefined;
  }

  const trimmed = url.replace(/\/$/, "");
  return trimmed.endsWith("/content") ? trimmed : `${trimmed}/content`;
};

const buildServiceOverrides = () => {
  const services = {
    authBaseUrl: getOptional("AUTH_BASE_URL"),
    contentBaseUrl: normalizeContentBaseUrl(getOptional("CONTENT_BASE_URL")),
    gatewayUrl: getOptional("GATEWAY_URL"),
    oauth2BaseUrl: getOptional("OAUTH2_BASE_URL") ?? getOptional("TOKEN_HOST"),
    quranReflectBaseUrl: getOptional("QURAN_REFLECT_BASE_URL"),
    searchBaseUrl: getOptional("SEARCH_BASE_URL"),
  };

  const entries = Object.entries(services).filter(([, value]) =>
    Boolean(value),
  );
  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries);
};

let mixedEnvironmentWarningLogged = false;

/** Returns a warning message when OAuth and API hosts mix prelive and production. */
export const detectMixedQfEnvironment = (
  oauth2BaseUrl: string,
  services?: RuntimeConfig["services"],
): string | null => {
  const hosts = [
    oauth2BaseUrl,
    services?.gatewayUrl,
    services?.contentBaseUrl,
    services?.authBaseUrl,
    services?.searchBaseUrl,
    services?.quranReflectBaseUrl,
  ].filter((value): value is string => Boolean(value));

  if (hosts.length < 2) {
    return null;
  }

  const isPrelive = (url: string) => url.includes("prelive");
  const isProductionQf = (url: string) =>
    url.includes("quran.foundation") && !url.includes("prelive");

  const hasPrelive = hosts.some(isPrelive);
  const hasProduction = hosts.some(isProductionQf);

  if (hasPrelive && hasProduction) {
    return (
      "Mixed Quran Foundation environments: OAuth and API hosts must both be " +
      "prelive (prelive-oauth2 / apis-prelive) or both production (oauth2 / apis). " +
      "See .env.example and run npm run smoke:oauth."
    );
  }

  return null;
};

const warnIfMixedQfEnvironment = (
  oauth2BaseUrl: string,
  services?: RuntimeConfig["services"],
): void => {
  if (mixedEnvironmentWarningLogged || process.env.NODE_ENV === "production") {
    return;
  }

  const message = detectMixedQfEnvironment(oauth2BaseUrl, services);
  if (!message) {
    return;
  }

  mixedEnvironmentWarningLogged = true;
  console.warn(`[followed-by-good] ${message}`);
};

export interface RuntimeConfig {
  appBaseUrl: string;
  clientId: string;
  clientSecret: string;
  defaultReaderChapter: string;
  isProduction: boolean;
  oauth2BaseUrl: string;
  redisUrl?: string;
  scopes: string;
  services?: {
    authBaseUrl?: string;
    contentBaseUrl?: string;
    gatewayUrl?: string;
    oauth2BaseUrl?: string;
    quranReflectBaseUrl?: string;
    searchBaseUrl?: string;
  };
  sessionSecret: string;
  translationIds: number[];
}

let cachedConfig: RuntimeConfig | null = null;

export const getConfig = (): RuntimeConfig => {
  if (cachedConfig) {
    return cachedConfig;
  }

  for (const key of REQUIRED_ENV_VARS) {
    getRequired(key);
  }

  const services = buildServiceOverrides();
  const oauth2BaseUrl = services?.oauth2BaseUrl ?? DEFAULT_OAUTH2_BASE_URL;

  warnIfMixedQfEnvironment(oauth2BaseUrl, services);

  cachedConfig = {
    appBaseUrl: getRequired("APP_BASE_URL"),
    clientId: getRequired("CLIENT_ID"),
    clientSecret: getRequired("CLIENT_SECRET"),
    defaultReaderChapter: String(
      toPositiveInt(getOptional("DEFAULT_READER_CHAPTER"), 1),
    ),
    isProduction: process.env.NODE_ENV === "production",
    oauth2BaseUrl,
    redisUrl: getOptional("REDIS_URL"),
    scopes:
      getOptional("SCOPES") ??
      "openid offline_access user note collection bookmark goal preference post comment",
    services,
    sessionSecret: getRequired("SESSION_SECRET"),
    translationIds: parseTranslationIds(getOptional("TRANSLATION_IDS")),
  };

  return cachedConfig;
};
