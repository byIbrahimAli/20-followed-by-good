export const SRS_INTERVALS_DAYS = [1, 3, 7, 30] as const;

export const addDays = (isoDate: string, days: number): string => {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const getIntervalDays = (intervalIndex: number): number => {
  const clamped = Math.min(
    Math.max(intervalIndex, 0),
    SRS_INTERVALS_DAYS.length - 1,
  );
  return SRS_INTERVALS_DAYS[clamped];
};

export const scheduleNextDue = (
  intervalIndex: number,
  fromDate = new Date().toISOString().slice(0, 10),
): { intervalIndex: number; nextDue: string } => {
  const days = getIntervalDays(intervalIndex);
  return {
    intervalIndex,
    nextDue: addDays(fromDate, days),
  };
};

export const gradeSession = (
  currentIntervalIndex: number,
  grade: "easy" | "hard",
  fromDate = new Date().toISOString().slice(0, 10),
): { intervalIndex: number; lastGrade: "easy" | "hard"; nextDue: string } => {
  if (grade === "hard") {
    const repeatIndex = Math.max(currentIntervalIndex - 1, 0);
    const scheduled = scheduleNextDue(repeatIndex, fromDate);
    return { ...scheduled, lastGrade: "hard" };
  }

  const nextIndex = Math.min(
    currentIntervalIndex + 1,
    SRS_INTERVALS_DAYS.length - 1,
  );
  const scheduled = scheduleNextDue(nextIndex, fromDate);
  return { ...scheduled, lastGrade: "easy" };
};

export const computeRetentionPercent = (
  intervalIndex: number,
  maxIndex = SRS_INTERVALS_DAYS.length - 1,
): number => Math.round((intervalIndex / maxIndex) * 100);

export const maxSrsIntervalIndex = (): number => SRS_INTERVALS_DAYS.length - 1;

export const masteredSessionSchedule = (
  fromDate = new Date().toISOString().slice(0, 10),
): { intervalIndex: number; lastGrade: "easy"; nextDue: string } => {
  const intervalIndex = maxSrsIntervalIndex();
  const scheduled = scheduleNextDue(intervalIndex, fromDate);
  return { ...scheduled, lastGrade: "easy" };
};
