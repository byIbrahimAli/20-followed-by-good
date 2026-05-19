import {
  buildSessionByAssignmentId,
  isMemorized,
} from "@/lib/fbg/memorization-status";
import {
  isDueTodayOrEarlier,
  type Assignment,
  type SrsSession,
} from "@/lib/fbg/store";

export interface ReviewItem {
  href: string;
  id: string;
  memorized: boolean;
  subtitle: string;
  title: string;
  verseKey: string;
  arabicSnippet?: string;
  nextDue?: string;
  sortAt: string;
}

const toSessionItem = (
  session: SrsSession,
  assignment: Assignment | undefined,
  memorized: boolean,
): ReviewItem => ({
  href: `/memorize/${session.id}`,
  id: session.id,
  memorized,
  subtitle: `${session.surahName} · ${session.verseKey}`,
  title: assignment?.category ?? "SRS review due",
  arabicSnippet: session.arabicText,
  nextDue: session.nextDue,
  sortAt: session.createdAt,
  verseKey: session.verseKey,
});

const toAssignmentItem = (
  assignment: Assignment,
  session: SrsSession | undefined,
  memorized: boolean,
): ReviewItem => ({
  href: session
    ? `/memorize/${session.id}`
    : `/recover/assign?id=${assignment.id}`,
  id: session?.id ?? assignment.id,
  memorized,
  subtitle: `${assignment.surahName} · ${assignment.verseKey}`,
  title: assignment.category,
  arabicSnippet: assignment.arabicText,
  nextDue: session?.nextDue ?? assignment.createdAt.slice(0, 10),
  sortAt: session?.createdAt ?? assignment.createdAt,
  verseKey: assignment.verseKey,
});

const sortNewestFirst = (items: ReviewItem[]): ReviewItem[] =>
  [...items].sort((a, b) => b.sortAt.localeCompare(a.sortAt));

/** One card per ayah — keeps the most recently touched session/assignment. */
export const dedupeItemsByVerseKey = (items: ReviewItem[]): ReviewItem[] => {
  const byVerseKey = new Map<string, ReviewItem>();
  for (const item of items) {
    const existing = byVerseKey.get(item.verseKey);
    if (!existing || item.sortAt > existing.sortAt) {
      byVerseKey.set(item.verseKey, item);
    }
  }
  return sortNewestFirst(Array.from(byVerseKey.values()));
};

export const buildReviewItems = (
  assignments: Assignment[],
  sessions: SrsSession[],
): ReviewItem[] => {
  const sessionByAssignment = buildSessionByAssignmentId(sessions);

  const dueSessions = sessions
    .filter((session) => isDueTodayOrEarlier(session.nextDue))
    .map((session) => {
      const assignment = session.assignmentId
        ? assignments.find((item) => item.id === session.assignmentId)
        : undefined;
      return { session, assignment };
    })
    .filter(({ session, assignment }) => !isMemorized(assignment, session))
    .map(({ session, assignment }) => toSessionItem(session, assignment, false));

  const pendingAssignments = assignments
    .filter((item) => item.status === "pending" || item.status === "memorizing")
    .map((item) => ({
      assignment: item,
      session: sessionByAssignment.get(item.id),
    }))
    .filter(({ assignment, session }) => {
      if (isMemorized(assignment, session)) {
        return false;
      }
      if (session && isDueTodayOrEarlier(session.nextDue)) {
        return false;
      }
      return true;
    })
    .map(({ assignment, session }) => toAssignmentItem(assignment, session, false));

  return dedupeItemsByVerseKey([...dueSessions, ...pendingAssignments]);
};

export const buildMemorizedItems = (
  assignments: Assignment[],
  sessions: SrsSession[],
): ReviewItem[] => {
  const sessionByAssignment = buildSessionByAssignmentId(sessions);
  const seenAssignmentIds = new Set<string>();
  const items: ReviewItem[] = [];

  for (const session of sessions) {
    const assignment = session.assignmentId
      ? assignments.find((item) => item.id === session.assignmentId)
      : undefined;
    if (!isMemorized(assignment, session)) {
      continue;
    }
    if (assignment) {
      seenAssignmentIds.add(assignment.id);
    }
    items.push(toSessionItem(session, assignment, true));
  }

  for (const assignment of assignments) {
    if (seenAssignmentIds.has(assignment.id)) {
      continue;
    }
    const session = sessionByAssignment.get(assignment.id);
    if (!isMemorized(assignment, session)) {
      continue;
    }
    items.push(toAssignmentItem(assignment, session, true));
  }

  return dedupeItemsByVerseKey(items);
};
