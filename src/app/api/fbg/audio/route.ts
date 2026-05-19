import { NextRequest } from "next/server";

import { loadVerseAudio } from "@/lib/fbg/load-verse-audio";
import { parseVerseKey } from "@/lib/data";
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

  const recitationParam = request.nextUrl.searchParams.get("recitationId");
  let recitationId: number | undefined;

  if (recitationParam) {
    const parsed = Number.parseInt(recitationParam, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return withSessionJson(
        sessionContext,
        { error: "recitationId must be a positive integer.", ok: false },
        400,
      );
    }
    recitationId = parsed;
  }

  const result = await loadVerseAudio(sessionContext.session, verseKey, recitationId);

  if ("error" in result) {
    return withSessionJson(
      sessionContext,
      { error: result.error, ok: false },
      502,
    );
  }

  return withSessionJson(sessionContext, {
    audioUrl: result.audioUrl,
    ok: true,
  });
}
