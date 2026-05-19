import { describe, expect, it } from "vitest";

import { buildTurningPointsSummary, formatVerseReference } from "@/lib/fbg/turning-points";
import { maxSrsIntervalIndex } from "@/lib/fbg/srs";
import type { Assignment, SrsSession } from "@/lib/fbg/store";

const today = new Date().toISOString().slice(0, 10);

const angerAssignment: Assignment = {
  id: "a1",
  verseKey: "41:34",
  category: "Anger",
  arabicText: "a",
  translationText: "t",
  surahName: "Fussilat",
  ayahNumber: 34,
  tafsirSnippet: "t",
  reflectionPrompt: "t",
  status: "done",
  createdAt: `${today}T12:00:00.000Z`,
};

const timeAssignment: Assignment = {
  ...angerAssignment,
  id: "a2",
  verseKey: "103:1",
  category: "Mindful Time",
  surahName: "Al-Asr",
  status: "memorizing",
  createdAt: `${today}T11:00:00.000Z`,
};

const timeSession: SrsSession = {
  id: "s1",
  verseKey: "103:1",
  assignmentId: "a2",
  arabicText: "a",
  translationText: "t",
  surahName: "Al-Asr",
  intervalIndex: 1,
  lastGrade: null,
  nextDue: today,
  createdAt: `${today}T11:30:00.000Z`,
};

describe("formatVerseReference", () => {
  it("returns ayah keys as-is", () => {
    expect(formatVerseReference("41:34")).toBe("41:34");
  });
});

describe("buildTurningPointsSummary", () => {
  it("counts retained ayat and lists latest per tag", () => {
    const summary = buildTurningPointsSummary(
      [angerAssignment, timeAssignment],
      [timeSession],
    );

    expect(summary.ayatRetained).toBe(1);
    expect(summary.dueToReview).toBe(1);
    expect(summary.recentByTag).toHaveLength(2);
    expect(summary.recentByTag[0].category).toBe("Anger");
    expect(summary.recentByTag[0].statusLabel).toBe("memorized");
    expect(
      summary.recentByTag.find((item) => item.category === "Mindful Time")?.statusLabel,
    ).toBe("in review");
  });

  it("marks mastered sessions as memorized for their tag", () => {
    const masteredSession: SrsSession = {
      ...timeSession,
      intervalIndex: maxSrsIntervalIndex(),
      nextDue: "2099-01-01",
    };
    const summary = buildTurningPointsSummary([timeAssignment], [masteredSession]);
    expect(summary.ayatRetained).toBe(1);
    expect(summary.dueToReview).toBe(0);
    expect(summary.recentByTag.find((item) => item.category === "Mindful Time")?.statusLabel).toBe(
      "memorized",
    );
  });
});
