import { getCategoryDisplay } from "@/lib/fbg/category-display";
import {
  buildSessionByAssignmentId,
  isMemorized,
  memorizationStatusLabel,
} from "@/lib/fbg/memorization-status";
import {
  isDueTodayOrEarlier,
  type Assignment,
  type SrsSession,
} from "@/lib/fbg/store";

export interface TurningPointEntry {
  category: string;
  href: string;
  icon: string;
  iconColor: string;
  reference: string;
  statusLabel: "memorized" | "in review";
  memorized: boolean;
  updatedAt: string;
}

export interface TurningPointsSummary {
  ayatRetained: number;
  dueToReview: number;
  recentByTag: TurningPointEntry[];
}

interface TaskActivity {
  category: string;
  href: string;
  memorized: boolean;
  reference: string;
  updatedAt: string;
  verseKey: string;
}

export const formatVerseReference = (
  verseKey: string,
  surahName?: string,
): string => {
  if (/^\d+:\d+$/.test(verseKey)) {
    return verseKey;
  }

  const chapter = verseKey.split(":")[0];
  if (chapter && /^\d+$/.test(chapter)) {
    return `Surah ${chapter}`;
  }

  return surahName ?? verseKey;
};

const activityTimestamp = (
  assignment: Assignment,
  session?: SrsSession,
): string => {
  const timestamps = [assignment.createdAt, session?.createdAt].filter(Boolean);
  return timestamps.sort().at(-1) ?? assignment.createdAt;
};

const activityFromAssignment = (
  assignment: Assignment,
  session?: SrsSession,
): TaskActivity => {
  const memorized = isMemorized(assignment, session);

  return {
    category: assignment.category,
    href: session
      ? `/memorize/${session.id}`
      : `/recover/assign?id=${assignment.id}`,
    memorized,
    reference: formatVerseReference(assignment.verseKey, assignment.surahName),
    updatedAt: activityTimestamp(assignment, session),
    verseKey: assignment.verseKey,
  };
};

const collectActivities = (
  assignments: Assignment[],
  sessions: SrsSession[],
): TaskActivity[] => {
  const sessionByAssignment = buildSessionByAssignmentId(sessions);
  const coveredAssignmentIds = new Set<string>();
  const activities: TaskActivity[] = [];

  for (const assignment of assignments) {
    coveredAssignmentIds.add(assignment.id);
    activities.push(
      activityFromAssignment(assignment, sessionByAssignment.get(assignment.id)),
    );
  }

  for (const session of sessions) {
    if (session.assignmentId && coveredAssignmentIds.has(session.assignmentId)) {
      continue;
    }
    const assignment = session.assignmentId
      ? assignments.find((item) => item.id === session.assignmentId)
      : undefined;
    if (!assignment) {
      continue;
    }
    activities.push(activityFromAssignment(assignment, session));
  }

  return activities;
};

const pickLatestPerCategory = (activities: TaskActivity[]): TaskActivity[] => {
  const byCategory = new Map<string, TaskActivity>();

  for (const activity of activities) {
    const existing = byCategory.get(activity.category);
    if (!existing) {
      byCategory.set(activity.category, activity);
      continue;
    }
    if (activity.updatedAt > existing.updatedAt) {
      byCategory.set(activity.category, activity);
      continue;
    }
    if (
      activity.updatedAt === existing.updatedAt &&
      activity.memorized &&
      !existing.memorized
    ) {
      byCategory.set(activity.category, activity);
    }
  }

  return Array.from(byCategory.values()).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
};

const isDueForReview = (
  activity: TaskActivity,
  assignments: Assignment[],
  sessions: SrsSession[],
): boolean => {
  if (activity.memorized) {
    return false;
  }

  const session = sessions.find((item) => item.verseKey === activity.verseKey);
  const assignment = assignments.find((item) => item.verseKey === activity.verseKey);

  return (
    (session !== undefined && isDueTodayOrEarlier(session.nextDue)) ||
    assignment?.status === "pending" ||
    assignment?.status === "memorizing"
  );
};

export const buildTurningPointsSummary = (
  assignments: Assignment[],
  sessions: SrsSession[],
): TurningPointsSummary => {
  const activities = collectActivities(assignments, sessions);
  const latestByTag = pickLatestPerCategory(activities);

  const retainedKeys = new Set<string>();
  for (const activity of activities) {
    if (activity.memorized) {
      retainedKeys.add(activity.verseKey);
    }
  }

  const dueToReview = activities.filter((activity) =>
    isDueForReview(activity, assignments, sessions),
  ).length;

  const recentByTag: TurningPointEntry[] = latestByTag.map((activity) => {
    const display = getCategoryDisplay(activity.category);
    const assignment = assignments.find(
      (item) => item.category === activity.category && item.verseKey === activity.verseKey,
    );
    const session = sessions.find(
      (item) =>
        item.verseKey === activity.verseKey &&
        (!assignment || item.assignmentId === assignment.id),
    );

    return {
      category: activity.category,
      href: activity.href,
      icon: display.icon,
      iconColor: display.color,
      reference: activity.reference,
      statusLabel: memorizationStatusLabel(assignment, session),
      memorized: activity.memorized,
      updatedAt: activity.updatedAt,
    };
  });

  return {
    ayatRetained: retainedKeys.size,
    dueToReview,
    recentByTag,
  };
};
