import { beforeEach, describe, expect, it, vi } from "vitest";

import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  loadSearchData: vi.fn(),
  loadReaderData: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  getSession: mocks.getSession,
}));

vi.mock("@/lib/data", () => ({
  loadSearchData: mocks.loadSearchData,
  loadReaderData: mocks.loadReaderData,
  parseVerseKey: (key: string) => (/^\d+:\d+$/.test(key) ? key : null),
}));

vi.mock("@/lib/route-helpers", () => ({
  withSessionJson: async (_ctx: unknown, payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
}));

describe("POST /api/fbg/assign", () => {
  beforeEach(() => {
    mocks.getSession.mockResolvedValue({ session: {} });
    mocks.loadSearchData.mockResolvedValue({ verseItems: [] });
    mocks.loadReaderData.mockResolvedValue({
      chapter: { nameSimple: "Az-Zumar" },
      verses: [],
    });
  });

  it("returns demo fallback when reader has no arabic text", async () => {
    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/fbg/assign", {
      method: "POST",
      body: JSON.stringify({ category: "Anger", slipText: "temper" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.assignment.arabicText).toBeTruthy();
    expect(body.assignment.translationText).toBeTruthy();
    expect(body.assignment.assignmentId).toBeTruthy();
    expect(body.assignment.demo).toBe(true);
  });
});

describe("GET /api/fbg/assign", () => {
  it("returns cached assignment by id", async () => {
    const { POST, GET } = await import("./route");

    const postRequest = new NextRequest("http://localhost/api/fbg/assign", {
      method: "POST",
      body: JSON.stringify({ category: "Reflection" }),
    });
    const postResponse = await POST(postRequest);
    const postBody = await postResponse.json();
    const id = postBody.assignment.assignmentId as string;

    const getRequest = new NextRequest(
      `http://localhost/api/fbg/assign?id=${encodeURIComponent(id)}`,
    );
    const getResponse = await GET(getRequest);
    const getBody = await getResponse.json();

    expect(getResponse.status).toBe(200);
    expect(getBody.assignment.assignmentId).toBe(id);
    expect(getBody.assignment.verseKey).toBe(postBody.assignment.verseKey);
  });
});
