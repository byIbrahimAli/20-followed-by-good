import "server-only";

import { getConfig } from "@/lib/env";
import { DEFAULT_OAUTH2_BASE_URL } from "@/lib/oauth";

const CONTENT_GATEWAY_DEFAULT = "https://apis.quran.foundation";

const encodeBasicAuth = (clientId: string, clientSecret: string): string => {
  const raw = `${clientId}:${clientSecret}`;
  if (typeof Buffer !== "undefined") {
    return Buffer.from(raw).toString("base64");
  }

  if (typeof globalThis.btoa === "function") {
    return globalThis.btoa(raw);
  }

  throw new Error("No base64 encoder available for content API auth.");
};

let cachedToken: { token: string; expiresAt: number } | null = null;

export const fetchContentAccessToken = async (): Promise<string> => {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const config = getConfig();
  const oauthBase =
    config.services?.oauth2BaseUrl ?? config.oauth2BaseUrl ?? DEFAULT_OAUTH2_BASE_URL;

  const response = await fetch(`${oauthBase}/oauth2/token`, {
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "content",
    }),
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${encodeBasicAuth(config.clientId, config.clientSecret)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!payload.access_token) {
    throw new Error("Token response did not include access_token.");
  }

  const ttlMs = (payload.expires_in ?? 3600) * 1000;
  cachedToken = {
    token: payload.access_token,
    expiresAt: Date.now() + ttlMs,
  };

  return payload.access_token;
};

export const resolveContentGatewayRoot = (): string => {
  const config = getConfig();
  const gateway = config.services?.gatewayUrl;
  if (gateway) {
    return gateway.replace(/\/$/, "");
  }

  const contentBase = config.services?.contentBaseUrl;
  if (contentBase) {
    return contentBase.replace(/\/content\/?$/, "").replace(/\/$/, "");
  }

  return CONTENT_GATEWAY_DEFAULT;
};

export const contentApiFetch = async (
  path: string,
  init?: RequestInit,
): Promise<Response> => {
  const config = getConfig();
  const gatewayRoot = resolveContentGatewayRoot();
  const accessToken = await fetchContentAccessToken();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(normalizedPath, `${gatewayRoot}/`);

  return fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "x-auth-token": accessToken,
      "x-client-id": config.clientId,
      ...(init?.headers ?? {}),
    },
  });
};
