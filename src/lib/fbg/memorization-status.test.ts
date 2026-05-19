import { describe, expect, it } from "vitest";

import { isMemorized } from "@/lib/fbg/memorization-status";
import { maxSrsIntervalIndex } from "@/lib/fbg/srs";
import type { Assignment, SrsSession } from "@/lib/fbg/store";

const today = new Date().toISOString().slice(0, 10);

const assignment: Assignment = {
  id: "a1",
  verseKey: "103:1",
  category: "Mindful Time",
  arabicText: "a",
  translationText: "t",
  surahName: "Al-Asr",
  ayahNumber: 1,
  tafsirSnippet: "t",
  reflectionPrompt: "t",
  status: "memorizing",
  createdAt: `${today}T10:00:00.000Z`,
};

const session: SrsSession = {
  id: "s1",
  verseKey: "103:1",
  assignmentId: "a1",
  arabicText: "a",
  translationText: "t",
  surahName: "Al-Asr",
  intervalIndex: maxSrsIntervalIndex(),
  lastGrade: "easy",
  nextDue: "2099-01-01",
  createdAt: `${today}T10:30:00.000Z`,
};

describe("isMemorized", () => {
  it("is true when assignment is done", () => {
    expect(isMemorized({ ...assignment, status: "done" }, session)).toBe(true);
  });

  it("is true when linked session is mastered even if assignment is memorizing", () => {
    expect(isMemorized(assignment, session)).toBe(true);
  });

  it("is false when still learning", () => {
    expect(
      isMemorized(assignment, { ...session, intervalIndex: 0 }),
    ).toBe(false);
  });
});
