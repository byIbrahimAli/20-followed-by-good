import { describe, expect, it } from "vitest";

import {
  buildReviewItems,
  computeReviewMetrics,
  type ReviewItem,
} from "@/lib/fbg/review-items";
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
    expect(items).toHaveLength(2);
    expect(items[0].href).toBe("/memorize/s1");
    expect(items[0].memorized).toBe(false);
    expect(items[1].href).toBe("/recover/assign?id=a1");
    expect(items[1].memorized).toBe(false);
  });

  it("marks mastered sessions", () => {
    const mastered: SrsSession = {
      ...baseSession,
      intervalIndex: maxSrsIntervalIndex(),
    };
    const items = buildReviewItems([], [mastered]);
    expect(items[0].memorized).toBe(true);
  });
});

describe("computeReviewMetrics", () => {
  it("returns zeros when empty", () => {
    expect(computeReviewMetrics([])).toEqual({
      totalInReview: 0,
      memorizedCount: 0,
      learningCount: 0,
      nextUp: null,
    });
  });

  it("counts memorized vs learning and picks next learning item due today", () => {
    const items: ReviewItem[] = [
      {
        href: "/a",
        id: "1",
        memorized: true,
        subtitle: "a",
        title: "A",
        nextDue: "2099-01-01",
      },
      {
        href: "/b",
        id: "2",
        memorized: false,
        subtitle: "b",
        title: "B",
        nextDue: today,
      },
    ];
    const metrics = computeReviewMetrics(items);
    expect(metrics.totalInReview).toBe(2);
    expect(metrics.memorizedCount).toBe(1);
    expect(metrics.learningCount).toBe(1);
    expect(metrics.nextUp?.id).toBe("2");
  });
});
