import { describe, expect, it } from "vitest";

import { buildMemorizedItems, buildReviewItems } from "@/lib/fbg/review-items";
import { maxSrsIntervalIndex } from "@/lib/fbg/srs";
import type { Assignment, SrsSession } from "@/lib/fbg/store";

const today = new Date().toISOString().slice(0, 10);

const baseAssignment: Assignment = {
  id: "a1",
  verseKey: "41:34",
  category: "Anger",
  arabicText: "test",
  translationText: "test",
  surahName: "Fussilat",
  ayahNumber: 34,
  tafsirSnippet: "test",
  reflectionPrompt: "test",
  status: "pending",
  createdAt: `${today}T10:00:00.000Z`,
};

const baseSession: SrsSession = {
  id: "s1",
  verseKey: "41:34",
  assignmentId: "a1",
  arabicText: "test",
  translationText: "test",
  surahName: "Fussilat",
  intervalIndex: 2,
  lastGrade: null,
  nextDue: today,
  createdAt: `${today}T10:00:00.000Z`,
};

describe("buildReviewItems", () => {
  it("includes due sessions and pending assignments", () => {
    const items = buildReviewItems([baseAssignment], [baseSession]);
    expect(items).toHaveLength(1);
    expect(items[0].href).toBe("/memorize/s1");
    expect(items[0].memorized).toBe(false);
  });

  it("excludes mastered sessions and assignments from the queue", () => {
    const mastered: SrsSession = {
      ...baseSession,
      intervalIndex: maxSrsIntervalIndex(),
      nextDue: "2099-01-01",
    };
    const items = buildReviewItems(
      [{ ...baseAssignment, status: "done" }],
      [mastered],
    );
    expect(items).toHaveLength(0);
  });

  it("excludes memorizing assignment when its session is mastered", () => {
    const items = buildReviewItems(
      [{ ...baseAssignment, status: "memorizing" }],
      [{ ...baseSession, intervalIndex: maxSrsIntervalIndex(), nextDue: "2099-01-01" }],
    );
    expect(items).toHaveLength(0);
  });
});

describe("buildMemorizedItems", () => {
  it("includes mastered sessions and done assignments", () => {
    const mastered: SrsSession = {
      ...baseSession,
      intervalIndex: maxSrsIntervalIndex(),
      nextDue: "2099-01-01",
    };
    const items = buildMemorizedItems(
      [{ ...baseAssignment, status: "done" }],
      [mastered],
    );
    expect(items).toHaveLength(1);
    expect(items[0].memorized).toBe(true);
    expect(items[0].href).toBe("/memorize/s1");
  });

  it("dedupes multiple mastered sessions for the same ayah", () => {
    const mastered = {
      intervalIndex: maxSrsIntervalIndex(),
      nextDue: "2099-01-01",
    };
    const items = buildMemorizedItems(
      [{ ...baseAssignment, status: "done" }],
      [
        { ...baseSession, id: "s1", createdAt: `${today}T10:00:00.000Z`, ...mastered },
        {
          ...baseSession,
          id: "s2",
          assignmentId: "a1",
          createdAt: `${today}T12:00:00.000Z`,
          ...mastered,
        },
        {
          ...baseSession,
          id: "s3",
          assignmentId: undefined,
          createdAt: `${today}T11:00:00.000Z`,
          ...mastered,
        },
      ],
    );
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe("s2");
  });
});
