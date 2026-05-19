import { describe, expect, it } from "vitest";

import {
  computeRetentionPercent,
  masteredSessionSchedule,
  maxSrsIntervalIndex,
} from "@/lib/fbg/srs";

describe("masteredSessionSchedule", () => {
  it("sets max interval and schedules next review", () => {
    const result = masteredSessionSchedule("2026-05-19");
    expect(result.intervalIndex).toBe(maxSrsIntervalIndex());
    expect(result.lastGrade).toBe("easy");
    expect(result.nextDue).toBe("2026-06-18");
    expect(computeRetentionPercent(result.intervalIndex)).toBe(100);
  });
});
