import { NextRequest } from "next/server";

import { loadVerseByKey, parseVerseKey } from "@/lib/data";
import { withSessionJson } from "@/lib/route-helpers";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sessionContext = await getSession(request);
  const verseKey = parseVerseKey(request.nextUrl.searchParams.get("verseKey"));

  if (!verseKey) {
    return withSessionJson(
      sessionContext,
      { error: "verseKey is required.", ok: false },
      400,
    );
  }

  try {
    const verse = await loadVerseByKey(sessionContext.session, verseKey);

    if (!verse?.arabicText) {
      return withSessionJson(
        sessionContext,
        { error: "Verse not available.", ok: false },
        502,
      );
    }

    return withSessionJson(sessionContext, {
      ok: true,
      verse: {
        arabicText: verse.arabicText,
        ayahNumber: verse.verseNumber,
        chapterName: verse.chapterName,
        translationText: verse.translationText ?? "",
        verseKey: verse.verseKey ?? verseKey,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load verse.";
    return withSessionJson(sessionContext, { error: message, ok: false }, 502);
  }
}
