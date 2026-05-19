import { isSessionMastered } from "@/lib/fbg/srs";
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
  arabicSnippet?: string;
  nextDue?: string;
}

export interface ReviewMetrics {
  totalInReview: number;
  memorizedCount: number;
  learningCount: number;
  nextUp: ReviewItem | null;
}

export const buildReviewItems = (
  assignments: Assignment[],
  sessions: SrsSession[],
): ReviewItem[] => {
  const dueSessions = sessions.filter((session) =>
    isDueTodayOrEarlier(session.nextDue),
  );
  const pendingAssignments = assignments.filter(
    (item) => item.status === "pending" || item.status === "memorizing",
  );

  return [
    ...dueSessions.map((session) => ({
      href: `/memorize/${session.id}`,
      id: session.id,
      memorized: isSessionMastered(session.intervalIndex),
      subtitle: `${session.surahName} · ${session.verseKey}`,
      title: "SRS review due",
      arabicSnippet: session.arabicText,
      nextDue: session.nextDue,
    })),
    ...pendingAssignments.map((item) => ({
      href: `/recover/assign?id=${item.id}`,
      id: item.id,
      memorized: item.status === "done",
      subtitle: item.verseKey,
      title: item.category,
      arabicSnippet: item.arabicText,
      nextDue: item.createdAt.slice(0, 10),
    })),
  ];
};

const isDueToday = (isoDate?: string): boolean =>
  Boolean(isoDate && isDueTodayOrEarlier(isoDate));

export const computeReviewMetrics = (items: ReviewItem[]): ReviewMetrics => {
  if (items.length === 0) {
    return {
      totalInReview: 0,
      memorizedCount: 0,
      learningCount: 0,
      nextUp: null,
    };
  }

  const memorizedCount = items.filter((item) => item.memorized).length;
  const learningCount = items.length - memorizedCount;

  const learningItems = items.filter((item) => !item.memorized);
  const nextUp =
    learningItems.find((item) => isDueToday(item.nextDue)) ?? learningItems[0] ?? null;

  return {
    totalInReview: items.length,
    memorizedCount,
    learningCount,
    nextUp,
  };
};
