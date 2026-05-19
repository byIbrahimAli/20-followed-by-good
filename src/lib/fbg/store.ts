"use client";

import { masteredSessionSchedule } from "@/lib/fbg/srs";

export type AssignmentStatus = "pending" | "memorizing" | "done";
export type SrsGrade = "easy" | "hard" | null;

export interface Slip {
  id: string;
  rawText: string;
  category: string;
  timestamp: string;
}

export interface Assignment {
  id: string;
  verseKey: string;
  category: string;
  arabicText: string;
  translationText: string;
  surahName: string;
  ayahNumber: number;
  tafsirSnippet: string;
  reflectionPrompt: string;
  status: AssignmentStatus;
  slipId?: string;
  createdAt: string;
}

export interface SrsSession {
  id: string;
  verseKey: string;
  assignmentId?: string;
  arabicText: string;
  translationText: string;
  surahName: string;
  intervalIndex: number;
  lastGrade: SrsGrade;
  nextDue: string;
  createdAt: string;
}

export interface Intention {
  id: string;
  title: string;
  description: string;
  completedToday: boolean;
}

interface FbgStore {
  slips: Slip[];
  assignments: Assignment[];
  srsSessions: SrsSession[];
  intentions: Intention[];
}

const STORAGE_KEY = "fbg-store-v1";
const SEED_KEY = "fbg-seeded";
const assignmentBackupKey = (id: string): string => `fbg-assignment-${id}`;

const defaultIntentions: Intention[] = [
  {
    id: "intention-fajr",
    title: "Pray Fajr on time",
    description: "Set alarm and make wudu before dawn.",
    completedToday: false,
  },
  {
    id: "intention-dhikr",
    title: "Evening adhkar",
    description: "Five minutes after Maghrib.",
    completedToday: false,
  },
  {
    id: "intention-quran",
    title: "Review one ayah",
    description: "From your recovery queue.",
    completedToday: false,
  },
];

const createId = (): string =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `fbg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const readStore = (): FbgStore => {
  if (typeof window === "undefined") {
    return {
      slips: [],
      assignments: [],
      srsSessions: [],
      intentions: defaultIntentions,
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        slips: [],
        assignments: [],
        srsSessions: [],
        intentions: defaultIntentions,
      };
    }

    const parsed = JSON.parse(raw) as Partial<FbgStore>;
    return {
      slips: parsed.slips ?? [],
      assignments: parsed.assignments ?? [],
      srsSessions: parsed.srsSessions ?? [],
      intentions:
        parsed.intentions && parsed.intentions.length > 0
          ? parsed.intentions
          : defaultIntentions,
    };
  } catch {
    return {
      slips: [],
      assignments: [],
      srsSessions: [],
      intentions: defaultIntentions,
    };
  }
};

export const STORE_UPDATED_EVENT = "fbg-store-updated";

const writeStore = (store: FbgStore): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(STORE_UPDATED_EVENT));
};

export const getStore = (): FbgStore => readStore();

export const addSlip = (rawText: string, category: string): Slip => {
  const store = readStore();
  const slip: Slip = {
    id: createId(),
    rawText,
    category,
    timestamp: new Date().toISOString(),
  };
  store.slips = [slip, ...store.slips].slice(0, 100);
  writeStore(store);
  return slip;
};

export const persistAssignmentBackup = (assignment: Assignment): void => {
  if (typeof window === "undefined") {
    return;
  }

  const serialized = JSON.stringify(assignment);
  window.sessionStorage.setItem(assignmentBackupKey(assignment.id), serialized);
  window.localStorage.setItem(assignmentBackupKey(assignment.id), serialized);
};

export const loadAssignmentFromBackup = (id: string): Assignment | null => {
  if (typeof window === "undefined") {
    return null;
  }

  for (const storage of [window.sessionStorage, window.localStorage]) {
    try {
      const raw = storage.getItem(assignmentBackupKey(id));
      if (raw) {
        return JSON.parse(raw) as Assignment;
      }
    } catch {
      /* ignore */
    }
  }

  return null;
};

export const addAssignment = (
  input: Omit<Assignment, "id" | "createdAt" | "status"> & {
    status?: AssignmentStatus;
  },
  id?: string,
): Assignment => {
  const store = readStore();
  const assignment: Assignment = {
    ...input,
    id: id ?? createId(),
    status: input.status ?? "pending",
    createdAt: new Date().toISOString(),
  };
  store.assignments = [
    assignment,
    ...store.assignments.filter((item) => item.id !== assignment.id),
  ];
  writeStore(store);
  persistAssignmentBackup(assignment);
  return assignment;
};

export const updateAssignment = (
  id: string,
  patch: Partial<Pick<Assignment, "status">>,
): Assignment | null => {
  const store = readStore();
  const index = store.assignments.findIndex((item) => item.id === id);
  if (index < 0) {
    return null;
  }

  store.assignments[index] = { ...store.assignments[index], ...patch };
  writeStore(store);
  return store.assignments[index];
};

export const getAssignment = (id: string): Assignment | null => {
  const fromStore = readStore().assignments.find((item) => item.id === id);
  if (fromStore) {
    return fromStore;
  }
  return loadAssignmentFromBackup(id);
};

export const upsertAssignment = (assignment: Assignment): Assignment => {
  const store = readStore();
  const index = store.assignments.findIndex((item) => item.id === assignment.id);
  if (index >= 0) {
    store.assignments[index] = assignment;
  } else {
    store.assignments = [assignment, ...store.assignments];
  }
  writeStore(store);
  persistAssignmentBackup(assignment);
  return assignment;
};

export const seedDemoIfNeeded = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const forceDemo = params.get("demo") === "1";
  if (!forceDemo && window.localStorage.getItem(SEED_KEY)) {
    return;
  }

  const store = readStore();
  const hasDue = store.srsSessions.some((s) => s.nextDue <= todayIso());
  if (hasDue && !forceDemo) {
    window.localStorage.setItem(SEED_KEY, "1");
    return;
  }

  const demo = addAssignment(
    {
      arabicText:
        "وَلَا تَسْتَوِي الْحَسَنَةُ وَلَا السَّيِّئَةُ ۚ ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ",
      ayahNumber: 34,
      category: "Anger",
      reflectionPrompt: "What triggered you, and what would restraint look like next time?",
      status: "memorizing",
      surahName: "Fussilat",
      tafsirSnippet: "Repel evil with what is better.",
      translationText:
        "Good and evil are not equal. Repel evil with what is better.",
      verseKey: "41:34",
    },
    "demo-seed-anger",
  );

  addSrsSession({
    arabicText: demo.arabicText,
    assignmentId: demo.id,
    intervalIndex: 0,
    nextDue: todayIso(),
    surahName: demo.surahName,
    translationText: demo.translationText,
    verseKey: demo.verseKey,
  });

  window.localStorage.setItem(SEED_KEY, "1");
};

export const addSrsSession = (
  input: Omit<SrsSession, "id" | "createdAt" | "intervalIndex" | "lastGrade" | "nextDue"> & {
    intervalIndex?: number;
    lastGrade?: SrsGrade;
    nextDue?: string;
  },
): SrsSession => {
  const store = readStore();
  const session: SrsSession = {
    ...input,
    id: createId(),
    intervalIndex: input.intervalIndex ?? 0,
    lastGrade: input.lastGrade ?? null,
    nextDue: input.nextDue ?? new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  };
  store.srsSessions = [session, ...store.srsSessions];
  writeStore(store);
  return session;
};

export const getSrsSession = (id: string): SrsSession | null =>
  readStore().srsSessions.find((item) => item.id === id) ?? null;

export interface SrsSessionSnapshot {
  intervalIndex: number;
  lastGrade: SrsGrade;
  nextDue: string;
  assignmentStatus?: AssignmentStatus;
}

export const snapshotSrsSession = (session: SrsSession): SrsSessionSnapshot => {
  const snapshot: SrsSessionSnapshot = {
    intervalIndex: session.intervalIndex,
    lastGrade: session.lastGrade,
    nextDue: session.nextDue,
  };

  if (session.assignmentId) {
    const assignment = getAssignment(session.assignmentId);
    if (assignment) {
      snapshot.assignmentStatus = assignment.status;
    }
  }

  return snapshot;
};

export const markSrsSessionMastered = (session: SrsSession): SrsSession | null => {
  const patch = masteredSessionSchedule();
  const updated = updateSrsSession(session.id, patch);
  if (updated && session.assignmentId) {
    updateAssignment(session.assignmentId, { status: "done" });
  }
  return updated;
};

export const restoreSrsSessionSnapshot = (
  sessionId: string,
  snapshot: SrsSessionSnapshot,
  assignmentId?: string,
): SrsSession | null => {
  const restored = updateSrsSession(sessionId, {
    intervalIndex: snapshot.intervalIndex,
    lastGrade: snapshot.lastGrade,
    nextDue: snapshot.nextDue,
  });
  if (assignmentId && snapshot.assignmentStatus) {
    updateAssignment(assignmentId, { status: snapshot.assignmentStatus });
  }
  return restored;
};

export const updateSrsSession = (
  id: string,
  patch: Partial<Pick<SrsSession, "intervalIndex" | "lastGrade" | "nextDue">>,
): SrsSession | null => {
  const store = readStore();
  const index = store.srsSessions.findIndex((item) => item.id === id);
  if (index < 0) {
    return null;
  }

  store.srsSessions[index] = { ...store.srsSessions[index], ...patch };
  writeStore(store);
  return store.srsSessions[index];
};

export const setIntentions = (intentions: Intention[]): void => {
  const store = readStore();
  store.intentions = intentions;
  writeStore(store);
};

export const toggleIntention = (id: string): void => {
  const store = readStore();
  store.intentions = store.intentions.map((item) =>
    item.id === id ? { ...item, completedToday: !item.completedToday } : item,
  );
  writeStore(store);
};

export const getRecentCategories = (limit = 5): string[] => {
  const counts = new Map<string, number>();
  for (const slip of readStore().slips) {
    counts.set(slip.category, (counts.get(slip.category) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([category]) => category);
};

export const todayIso = (): string => new Date().toISOString().slice(0, 10);

export const isDueTodayOrEarlier = (nextDue: string): boolean =>
  nextDue <= todayIso();
