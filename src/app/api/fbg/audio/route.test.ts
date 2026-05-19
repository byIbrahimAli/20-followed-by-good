import { beforeEach, describe, expect, it, vi } from "vitest";

import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  loadVerseAudio: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  getSession: mocks.getSession,
}));

vi.mock("@/lib/fbg/load-verse-audio", () => ({
  loadVerseAudio: mocks.loadVerseAudio,
}));

vi.mock("@/lib/route-helpers", () => ({
  withSessionJson: async (_ctx: unknown, payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
}));

describe("GET /api/fbg/audio", () => {
  beforeEach(() => {
    mocks.getSession.mockResolvedValue({ session: {} });
    mocks.loadVerseAudio.mockResolvedValue({
      audioUrl: "https://audio.example/39-53.mp3",
    });
  });

  it("returns audioUrl for a valid verseKey", async () => {
    const { GET } = await import("./route");
    const request = new NextRequest(
      "http://localhost/api/fbg/audio?verseKey=39%3A53",
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.audioUrl).toBe("https://audio.example/39-53.mp3");
    expect(mocks.loadVerseAudio).toHaveBeenCalledWith({}, "39:53", undefined);
  });

  it("rejects missing verseKey", async () => {
    const { GET } = await import("./route");
    const request = new NextRequest("http://localhost/api/fbg/audio");

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error).toMatch(/verseKey/i);
  });

  it("forwards recitationId when provided", async () => {
    const { GET } = await import("./route");
    const request = new NextRequest(
      "http://localhost/api/fbg/audio?verseKey=1%3A1&recitationId=7",
    );

    await GET(request);

    expect(mocks.loadVerseAudio).toHaveBeenCalledWith({}, "1:1", 7);
  });

  it("returns error payload when audio load fails", async () => {
    mocks.loadVerseAudio.mockResolvedValue({ error: "Audio unavailable." });
    const { GET } = await import("./route");
    const request = new NextRequest(
      "http://localhost/api/fbg/audio?verseKey=2%3A255",
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Audio unavailable.");
  });
});
