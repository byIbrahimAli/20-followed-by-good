import { describe, expect, it } from "vitest";

import {
  buildReviewItems,
  computeReviewMetrics,
  type ReviewItem,
} from "@/lib/fbg/review-items";
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
    expect(items[1].href).toBe("/recover/assign?id=a1");
  });
});

describe("computeReviewMetrics", () => {
  it("returns zeros when empty", () => {
    expect(computeReviewMetrics([])).toEqual({
      totalInReview: 0,
      avgProgress: 0,
      closest: null,
    });
  });

  it("averages progress and picks highest percent", () => {
    const items: ReviewItem[] = [
      {
        href: "/a",
        id: "1",
        percent: 10,
        subtitle: "a",
        title: "A",
        nextDue: "2099-01-01",
      },
      {
        href: "/b",
        id: "2",
        percent: 50,
        subtitle: "b",
        title: "B",
        nextDue: today,
      },
    ];
    const metrics = computeReviewMetrics(items);
    expect(metrics.totalInReview).toBe(2);
    expect(metrics.avgProgress).toBe(30);
    expect(metrics.closest?.id).toBe("2");
  });

  it("breaks ties by preferring item due today", () => {
    const items: ReviewItem[] = [
      {
        href: "/a",
        id: "1",
        percent: 50,
        subtitle: "a",
        title: "A",
        nextDue: "2099-01-01",
      },
      {
        href: "/b",
        id: "2",
        percent: 50,
        subtitle: "b",
        title: "B",
        nextDue: today,
      },
    ];
    expect(computeReviewMetrics(items).closest?.id).toBe("2");
  });
});
