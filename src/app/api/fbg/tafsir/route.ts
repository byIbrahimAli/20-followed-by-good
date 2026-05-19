import { NextRequest } from "next/server";

import { parseVerseKey } from "@/lib/data";
import { loadTafsir } from "@/lib/fbg/load-tafsir";
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

  const tafsirParam = request.nextUrl.searchParams.get("tafsirId");
  let tafsirId: number | undefined;

  if (tafsirParam) {
    const parsed = Number.parseInt(tafsirParam, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return withSessionJson(
        sessionContext,
        { error: "tafsirId must be a positive integer.", ok: false },
        400,
      );
    }
    tafsirId = parsed;
  }

  const result = await loadTafsir(sessionContext.session, verseKey, tafsirId);

  if ("error" in result) {
    return withSessionJson(
      sessionContext,
      { error: result.error, ok: false },
      502,
    );
  }

  return withSessionJson(sessionContext, {
    ok: true,
    text: result.text,
  });
}
