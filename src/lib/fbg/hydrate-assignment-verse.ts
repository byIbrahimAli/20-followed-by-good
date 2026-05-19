import type { Assignment } from "@/lib/fbg/store";

/** True when cached Arabic looks like a search snippet or truncated demo, not a full ayah. */
export const isLikelyIncompleteVerse = (arabicText: string): boolean => {
  const trimmed = arabicText.trim();
  if (!trimmed) {
    return true;
  }

  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount <= 2 && trimmed.length < 40) {
    return true;
  }

  return false;
};

export interface HydratedVerseFields {
  arabicText: string;
  ayahNumber: number;
  surahName: string;
  translationText: string;
  verseKey: string;
}

export const fetchVerseFields = async (
  verseKey: string,
): Promise<HydratedVerseFields | null> => {
  const response = await fetch(
    `/api/fbg/verse?verseKey=${encodeURIComponent(verseKey)}`,
    { credentials: "include" },
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    ok?: boolean;
    verse?: HydratedVerseFields & { chapterName?: string };
  };

  if (!payload.ok || !payload.verse?.arabicText) {
    return null;
  }

  return {
    arabicText: payload.verse.arabicText,
    ayahNumber: payload.verse.ayahNumber,
    surahName: payload.verse.chapterName ?? payload.verse.surahName,
    translationText: payload.verse.translationText,
    verseKey: payload.verse.verseKey,
  };
};

export const mergeHydratedVerse = (
  assignment: Assignment,
  verse: HydratedVerseFields,
): Assignment => ({
  ...assignment,
  arabicText: verse.arabicText,
  ayahNumber: verse.ayahNumber ?? assignment.ayahNumber,
  surahName: verse.surahName || assignment.surahName,
  translationText: verse.translationText || assignment.translationText,
  verseKey: verse.verseKey,
});
