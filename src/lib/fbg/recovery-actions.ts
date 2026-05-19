import {
  fetchVerseFields,
  isLikelyIncompleteVerse,
  mergeHydratedVerse,
} from "@/lib/fbg/hydrate-assignment-verse";
import { extractCategory } from "@/lib/fbg/slip-taxonomy";
import {
  addAssignment,
  addSlip,
  persistAssignmentBackup,
  upsertAssignment,
  type Assignment,
} from "@/lib/fbg/store";

export interface AssignApiPayload {
  assignment?: {
    assignmentId?: string;
    arabicText: string;
    ayahNumber: number;
    category: string;
    reflectionPrompt: string;
    surahName: string;
    tafsirSnippet: string;
    translationText: string;
    verseKey: string;
  };
  message?: string;
  ok?: boolean;
}

export const continueToAyah = async (
  slipText: string,
  options?: { category?: string },
): Promise<Assignment> => {
  const trimmed = slipText.trim();
  if (!trimmed) {
    throw new Error("Describe what slipped first.");
  }

  const category = options?.category ?? extractCategory(trimmed);
  const slip = addSlip(trimmed, category);

  const response = await fetch("/api/fbg/assign", {
    body: JSON.stringify({ category, slipText: trimmed }),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  let payload: AssignApiPayload;
  try {
    payload = (await response.json()) as AssignApiPayload;
  } catch {
    throw new Error(
      response.ok
        ? "Assignment service returned an invalid response."
        : `Assignment failed (${response.status}). Check server environment variables.`,
    );
  }

  if (!response.ok || !payload.assignment) {
    throw new Error(payload.message ?? `Assignment failed (${response.status}).`);
  }

  const serverId = payload.assignment.assignmentId;
  let assignment = addAssignment(
    {
      ...payload.assignment,
      slipId: slip.id,
    },
    serverId,
  );

  if (isLikelyIncompleteVerse(assignment.arabicText)) {
    const verse = await fetchVerseFields(assignment.verseKey);
    if (verse) {
      assignment = upsertAssignment(mergeHydratedVerse(assignment, verse));
    }
  }

  persistAssignmentBackup(assignment);
  return assignment;
};
