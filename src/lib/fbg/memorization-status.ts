import { isSessionMastered } from "@/lib/fbg/srs";
import type { Assignment, SrsSession } from "@/lib/fbg/store";

export const buildSessionByAssignmentId = (
  sessions: SrsSession[],
): Map<string, SrsSession> => {
  const map = new Map<string, SrsSession>();
  for (const session of sessions) {
    if (!session.assignmentId) {
      continue;
    }
    const existing = map.get(session.assignmentId);
    if (!existing || session.createdAt > existing.createdAt) {
      map.set(session.assignmentId, session);
    }
  }
  return map;
};

/** Single source of truth: assignment done and/or linked SRS session mastered. */
export const isMemorized = (
  assignment?: Assignment | null,
  session?: SrsSession | null,
): boolean => {
  if (assignment?.status === "done") {
    return true;
  }
  if (session && isSessionMastered(session.intervalIndex)) {
    return true;
  }
  return false;
};

export const memorizationStatusLabel = (
  assignment?: Assignment | null,
  session?: SrsSession | null,
): "memorized" | "in review" =>
  isMemorized(assignment, session) ? "memorized" : "in review";
