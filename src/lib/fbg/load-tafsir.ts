import "server-only";

import { contentApiFetch } from "@/lib/fbg/content-http";
import { getConfig } from "@/lib/env";
import { createClients } from "@/lib/sdk";
import type { StoredSession } from "@/lib/session/store";

export const getDefaultTafsirId = (): number => {
  const raw = process.env.DEFAULT_TAFSIR_ID;
  if (!raw) {
    return 169;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 169;
};

type JsonObject = Record<string, unknown>;

const asObject = (value: unknown): JsonObject => {
  if (!value || typeof value !== "object") {
    return {};
  }

  return value as JsonObject;
};

const asString = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

export const stripHtml = (html: string): string =>
  html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export const extractTafsirText = (payload: unknown): string | null => {
  const root = asObject(payload);
  const tafsirBlock = asObject(root.tafsir);
  const blockText = stripHtml(asString(tafsirBlock.text));
  if (blockText) {
    return blockText;
  }

  const verse = asObject(root.verse ?? root);
  const tafsirs = verse.tafsirs;

  if (!Array.isArray(tafsirs) || tafsirs.length === 0) {
    return null;
  }

  for (const item of tafsirs) {
    const text = stripHtml(asString(asObject(item).text));
    if (text) {
      return text;
    }
  }

  return null;
};

type VerseByKeyLoader = (
  verseKey: string,
  params: Record<string, unknown>,
) => Promise<unknown>;

const loadViaHttp = async (
  verseKey: string,
  tafsirId: number,
): Promise<unknown> => {
  const config = getConfig();
  const params = new URLSearchParams({
    fields: "text_uthmani",
    tafsirs: String(tafsirId),
    words: "false",
  });
  for (const id of config.translationIds) {
    params.append("translations", String(id));
  }

  const path = `/content/api/v4/verses/by_key/${encodeURIComponent(verseKey)}?${params.toString()}`;
  const response = await contentApiFetch(path);

  if (!response.ok) {
    const tafsirPath = `/content/api/v4/tafsirs/${tafsirId}/by_ayah/${encodeURIComponent(verseKey)}`;
    const fallback = await contentApiFetch(tafsirPath);
    if (!fallback.ok) {
      throw new Error(`Content tafsir request failed: ${response.status} ${response.statusText}`);
    }
    return fallback.json();
  }

  return response.json();
};

export const loadTafsir = async (
  session: StoredSession,
  verseKey: string,
  tafsirId?: number,
): Promise<{ text: string } | { error: string }> => {
  const id = tafsirId ?? getDefaultTafsirId();

  try {
    let payload: unknown;
    try {
      payload = await loadViaHttp(verseKey, id);
    } catch (httpError) {
      const { serverClient } = await createClients(session);
      const byKey = serverClient.content?.v4?.verses?.byKey as
        | VerseByKeyLoader
        | undefined;

      if (typeof byKey !== "function") {
        throw httpError;
      }

      payload = await byKey(verseKey, {
        fields: { textUthmani: false },
        tafsirs: [id],
        translations: [],
        words: false,
      });
    }

    const text = extractTafsirText(payload);
    if (!text) {
      return { error: "Tafsir not available for this verse." };
    }

    return { text };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load tafsir.";
    return { error: message };
  }
};
