import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { continueToAyah } from "./recovery-actions";

const storage: Record<string, string> = {};

beforeEach(() => {
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
  });
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => storage[`s:${key}`] ?? null,
    setItem: (key: string, value: string) => {
      storage[`s:${key}`] = value;
    },
    removeItem: (key: string) => {
      delete storage[`s:${key}`];
    },
  });
  vi.stubGlobal("crypto", {
    randomUUID: () => "test-uuid-1",
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  Object.keys(storage).forEach((key) => delete storage[key]);
});

describe("continueToAyah", () => {
  it("posts slip and returns assignment", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        assignment: {
          assignmentId: "server-id-1",
          arabicText: "بسم الله",
          ayahNumber: 1,
          category: "Anger",
          reflectionPrompt: "Reflect",
          surahName: "Fussilat",
          tafsirSnippet: "Tafsir",
          translationText: "Bismillah",
          verseKey: "41:34",
        },
        ok: true,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const assignment = await continueToAyah("I lost my temper");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/fbg/assign",
      expect.objectContaining({ method: "POST" }),
    );
    expect(assignment.category).toBe("Anger");
    expect(assignment.id).toBe("server-id-1");
    expect(assignment.arabicText).toBe("بسم الله");
  });

  it("throws when API fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: "Assignment failed." }),
      }),
    );

    await expect(continueToAyah("test slip")).rejects.toThrow("Assignment failed.");
  });
});
