import { randomUUID } from "node:crypto";

import { NextRequest } from "next/server";

import {
  getCategoryQuery,
  getDemoVerseForCategory,
  getFallbackVerseKey,
  getMockTafsir,
  getReflectionPrompt,
} from "@/lib/fbg/category-queries";
import { loadSearchData, loadVerseByKey, parseVerseKey } from "@/lib/data";
import { withSessionJson } from "@/lib/route-helpers";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export interface CachedAssignment {
  id: string;
  verseKey: string;
  category: string;
  arabicText: string;
  translationText: string;
  surahName: string;
  ayahNumber: number;
  tafsirSnippet: string;
  reflectionPrompt: string;
  slipText?: string;
  demo?: boolean;
}

const assignmentCache = new Map<string, CachedAssignment>();

const resolveVerseKey = async (
  session: Awaited<ReturnType<typeof getSession>>["session"],
  category: string,
): Promise<string> => {
  const query = getCategoryQuery(category);
  const search = await loadSearchData(session, query);
  const fromSearch =
    search.verseItems.find((item) => parseVerseKey(item.verseKey))?.verseKey ??
    null;

  if (fromSearch && parseVerseKey(fromSearch)) {
    return fromSearch;
  }

  return getFallbackVerseKey(category);
};

const buildFromDemo = (category: string, verseKey: string): CachedAssignment => {
  const demo = getDemoVerseForCategory(category);
  return {
    id: randomUUID(),
    verseKey: demo.verseKey || verseKey,
    category,
    arabicText: demo.arabicText,
    translationText: demo.translationText,
    surahName: demo.surahName,
    ayahNumber: demo.ayahNumber,
    tafsirSnippet: getMockTafsir(category),
    reflectionPrompt: getReflectionPrompt(category),
    demo: true,
  };
};

const toResponse = (item: CachedAssignment) => ({
  assignment: {
    assignmentId: item.id,
    arabicText: item.arabicText,
    ayahNumber: item.ayahNumber,
    category: item.category,
    reflectionPrompt: item.reflectionPrompt,
    surahName: item.surahName,
    tafsirSnippet: item.tafsirSnippet,
    translationText: item.translationText,
    verseKey: item.verseKey,
    demo: item.demo ?? false,
  },
  ok: true,
  slipText: item.slipText,
});

export async function GET(request: NextRequest) {
  const sessionContext = await getSession(request);
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return withSessionJson(
      sessionContext,
      { message: "Assignment id required.", ok: false },
      400,
    );
  }

  const cached = assignmentCache.get(id);
  if (!cached) {
    return withSessionJson(
      sessionContext,
      { message: "Assignment not found.", ok: false },
      404,
    );
  }

  return withSessionJson(sessionContext, toResponse(cached));
}

export async function POST(request: NextRequest) {
  const sessionContext = await getSession(request);
  const body = (await request.json().catch(() => ({}))) as {
    category?: string;
    slipText?: string;
  };

  const category = String(body.category ?? "Reflection").trim() || "Reflection";
  const slipText = String(body.slipText ?? "").trim();
  const verseKey = await resolveVerseKey(sessionContext.session, category);
  const parsed = parseVerseKey(verseKey);

  if (!parsed) {
    const demo = buildFromDemo(category, getFallbackVerseKey(category));
    demo.slipText = slipText;
    assignmentCache.set(demo.id, demo);
    return withSessionJson(sessionContext, toResponse(demo));
  }

  let assignment: CachedAssignment | null = null;

  try {
    const verse = await loadVerseByKey(sessionContext.session, parsed);

    if (verse?.arabicText && verse.translationText) {
      assignment = {
        id: randomUUID(),
        verseKey: parsed,
        category,
        arabicText: verse.arabicText,
        translationText: verse.translationText,
        surahName: verse.chapterName,
        ayahNumber: verse.verseNumber ?? Number(parsed.split(":")[1]),
        tafsirSnippet: getMockTafsir(category),
        reflectionPrompt: getReflectionPrompt(category),
        slipText,
        demo: false,
      };
    }
  } catch {
    /* fall through to demo */
  }

  if (!assignment) {
    assignment = buildFromDemo(category, parsed);
    assignment.slipText = slipText;
  }

  assignmentCache.set(assignment.id, assignment);
  return withSessionJson(sessionContext, toResponse(assignment));
}
