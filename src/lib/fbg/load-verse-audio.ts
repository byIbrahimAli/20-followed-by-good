import "server-only";

import { contentApiFetch } from "@/lib/fbg/content-http";
import { createClients } from "@/lib/sdk";
import type { StoredSession } from "@/lib/session/store";

const VERSES_CDN = "https://verses.quran.com";

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

const loadViaHttp = async (
  verseKey: string,
  recitationId: string,
): Promise<VerseRecitationResponse> => {
  const path = `/content/api/v4/recitations/${encodeURIComponent(recitationId)}/by_ayah/${encodeURIComponent(verseKey)}`;
  const response = await contentApiFetch(path);

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
  try {
    return await loadViaHttp(verseKey, recitationId);
  } catch (httpError) {
    const sdkLoader = resolveSdkLoader(serverClient);
    if (!sdkLoader) {
      throw httpError;
    }

    return sdkLoader(verseKey, recitationId);
  }
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
