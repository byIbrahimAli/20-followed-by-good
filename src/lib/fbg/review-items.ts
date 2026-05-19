import { computeRetentionPercent } from "@/lib/fbg/srs";
import {
  isDueTodayOrEarlier,
  type Assignment,
  type SrsSession,
} from "@/lib/fbg/store";

export interface ReviewItem {
  href: string;
  id: string;
  percent: number;
  subtitle: string;
  title: string;
  arabicSnippet?: string;
  nextDue?: string;
}

export interface ReviewMetrics {
  totalInReview: number;
  avgProgress: number;
  closest: ReviewItem | null;
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
      percent: computeRetentionPercent(session.intervalIndex),
      subtitle: `${session.surahName} · ${session.verseKey}`,
      title: "SRS review due",
      arabicSnippet: session.arabicText,
      nextDue: session.nextDue,
    })),
    ...pendingAssignments.map((item) => ({
      href: `/recover/assign?id=${item.id}`,
      id: item.id,
      percent: item.status === "memorizing" ? 40 : 10,
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
    return { totalInReview: 0, avgProgress: 0, closest: null };
  }

  const avgProgress = Math.round(
    items.reduce((sum, item) => sum + item.percent, 0) / items.length,
  );

  let closest = items[0];
  for (const item of items.slice(1)) {
    if (item.percent > closest.percent) {
      closest = item;
      continue;
    }
    if (item.percent !== closest.percent) {
      continue;
    }
    if (isDueToday(item.nextDue) && !isDueToday(closest.nextDue)) {
      closest = item;
    }
  }

  return {
    totalInReview: items.length,
    avgProgress,
    closest,
  };
};
