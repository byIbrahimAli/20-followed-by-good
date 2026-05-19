import { beforeEach, describe, expect, it, vi } from "vitest";

import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  loadTafsir: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  getSession: mocks.getSession,
}));

vi.mock("@/lib/fbg/load-tafsir", () => ({
  loadTafsir: mocks.loadTafsir,
}));

vi.mock("@/lib/route-helpers", () => ({
  withSessionJson: async (_ctx: unknown, payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
}));

describe("GET /api/fbg/tafsir", () => {
  beforeEach(() => {
    mocks.getSession.mockResolvedValue({ session: {} });
    mocks.loadTafsir.mockResolvedValue({
      text: "Tafsir for this ayah.",
    });
  });

  it("returns text for a valid verseKey", async () => {
    const { GET } = await import("./route");
    const request = new NextRequest(
      "http://localhost/api/fbg/tafsir?verseKey=39%3A53",
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.text).toBe("Tafsir for this ayah.");
    expect(mocks.loadTafsir).toHaveBeenCalledWith({}, "39:53", undefined);
  });

  it("rejects missing verseKey", async () => {
    const { GET } = await import("./route");
    const request = new NextRequest("http://localhost/api/fbg/tafsir");

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error).toMatch(/verseKey/i);
  });

  it("returns error payload when tafsir load fails", async () => {
    mocks.loadTafsir.mockResolvedValue({ error: "Tafsir unavailable." });
    const { GET } = await import("./route");
    const request = new NextRequest(
      "http://localhost/api/fbg/tafsir?verseKey=2%3A255",
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Tafsir unavailable.");
  });
});
