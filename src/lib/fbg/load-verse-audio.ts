import "server-only";

import { getConfig } from "@/lib/env";
import { DEFAULT_OAUTH2_BASE_URL } from "@/lib/oauth";
import { createClients } from "@/lib/sdk";
import type { StoredSession } from "@/lib/session/store";

const VERSES_CDN = "https://verses.quran.com";
const CONTENT_GATEWAY_DEFAULT = "https://apis.quran.foundation";

export const getDefaultRecitationId = (): number => {
  const raw = process.env.DEFAULT_RECITER_ID;
  if (!raw) {
    return 7;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 7;
};

type VerseRecitationFile = {
  audioUrl?: string | null;
  url?: string | null;
};

type VerseRecitationResponse = {
  audioFiles?: VerseRecitationFile[];
  audio_files?: VerseRecitationFile[];
};

type VerseRecitationLoader = (
  verseKey: string,
  recitationId: string,
) => Promise<VerseRecitationResponse>;

type ServerClientWithAudio = Awaited<
  ReturnType<typeof createClients>
>["serverClient"] & {
  audio?: {
    findVerseRecitationsByKey?: VerseRecitationLoader;
  };
};

const normalizeRecitationUrl = (file: VerseRecitationFile): string | null => {
  if (file.audioUrl) {
    return file.audioUrl;
  }

  if (!file.url) {
    return null;
  }

  if (file.url.startsWith("http://") || file.url.startsWith("https://")) {
    return file.url;
  }

  return `${VERSES_CDN}/${file.url.replace(/^\/+/, "")}`;
};

const verseRecitationFiles = (
  payload: VerseRecitationResponse,
): VerseRecitationFile[] => payload.audioFiles ?? payload.audio_files ?? [];

export const extractAudioUrl = (
  payload: VerseRecitationResponse,
): string | null => {
  for (const file of verseRecitationFiles(payload)) {
    const audioUrl = normalizeRecitationUrl(file);
    if (audioUrl) {
      return audioUrl;
    }
  }

  return null;
};

const resolveSdkLoader = (
  serverClient: ServerClientWithAudio,
): VerseRecitationLoader | null => {
  const v4Loader = serverClient.content?.v4?.audio?.verseRecitation?.byKey;
  if (typeof v4Loader === "function") {
    return (verseKey, recitationId) =>
      v4Loader(verseKey, recitationId) as Promise<VerseRecitationResponse>;
  }

  const legacyLoader = serverClient.audio?.findVerseRecitationsByKey;
  if (typeof legacyLoader === "function") {
    return legacyLoader;
  }

  return null;
};

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

const fetchContentAccessToken = async (): Promise<string> => {
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

  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) {
    throw new Error("Token response did not include access_token.");
  }

  return payload.access_token;
};

const resolveContentGatewayRoot = (): string => {
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

const loadViaHttp = async (
  verseKey: string,
  recitationId: string,
): Promise<VerseRecitationResponse> => {
  const config = getConfig();
  const gatewayRoot = resolveContentGatewayRoot();
  const accessToken = await fetchContentAccessToken();
  const path = `/content/api/v4/recitations/${encodeURIComponent(recitationId)}/by_ayah/${encodeURIComponent(verseKey)}`;
  const url = new URL(path, `${gatewayRoot}/`);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "x-auth-token": accessToken,
      "x-client-id": config.clientId,
    },
  });

  if (!response.ok) {
    throw new Error(`Content audio request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as VerseRecitationResponse;
};

const loadVerseRecitationPayload = async (
  serverClient: ServerClientWithAudio,
  verseKey: string,
  recitationId: string,
): Promise<VerseRecitationResponse> => {
  const sdkLoader = resolveSdkLoader(serverClient);
  if (sdkLoader) {
    try {
      return await sdkLoader(verseKey, recitationId);
    } catch (sdkError) {
      try {
        return await loadViaHttp(verseKey, recitationId);
      } catch {
        throw sdkError;
      }
    }
  }

  return loadViaHttp(verseKey, recitationId);
};

export const loadVerseAudio = async (
  session: StoredSession,
  verseKey: string,
  recitationId?: number,
): Promise<{ audioUrl: string } | { error: string }> => {
  const id = String(recitationId ?? getDefaultRecitationId());

  try {
    const { serverClient } = await createClients(session);
    const payload = await loadVerseRecitationPayload(
      serverClient as ServerClientWithAudio,
      verseKey,
      id,
    );
    const audioUrl = extractAudioUrl(payload);

    if (!audioUrl) {
      return { error: "Audio not available for this verse." };
    }

    return { audioUrl };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load verse audio.";
    return { error: message };
  }
};
