import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClients: vi.fn(),
  fetch: vi.fn(),
  getConfig: vi.fn(),
}));

vi.mock("@/lib/sdk", () => ({
  createClients: mocks.createClients,
}));

vi.mock("@/lib/env", () => ({
  getConfig: mocks.getConfig,
}));

import { extractAudioUrl, loadVerseAudio } from "@/lib/fbg/load-verse-audio";

describe("extractAudioUrl", () => {
  it("returns absolute audioUrl when present", () => {
    expect(
      extractAudioUrl({
        audioFiles: [{ audioUrl: "https://audio.example/1-1.mp3" }],
      }),
    ).toBe("https://audio.example/1-1.mp3");
  });

  it("normalizes relative url paths to the verses CDN", () => {
    expect(
      extractAudioUrl({
        audioFiles: [{ url: "AbdulBaset/Murattal/mp3/001001.mp3" }],
      }),
    ).toBe("https://verses.quran.com/AbdulBaset/Murattal/mp3/001001.mp3");
  });

  it("accepts snake_case audio_files from the content API", () => {
    expect(
      extractAudioUrl({
        audio_files: [{ url: "Alafasy/mp3/001001.mp3" }],
      }),
    ).toBe("https://verses.quran.com/Alafasy/mp3/001001.mp3");
  });
});

describe("loadVerseAudio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", mocks.fetch);
    mocks.getConfig.mockReturnValue({
      clientId: "client-id",
      clientSecret: "client-secret",
      oauth2BaseUrl: "https://oauth.example",
      services: {
        gatewayUrl: "https://apis.example",
      },
    });
  });

  it("falls back to content.v4.audio when HTTP fails", async () => {
    const byKey = vi.fn(async () => ({
      audioFiles: [{ audioUrl: "https://audio.example/39-53.mp3" }],
    }));

    mocks.fetch.mockImplementation(async (url: string) => {
      if (String(url).includes("/oauth2/token")) {
        return {
          ok: true,
          json: async () => ({ access_token: "app-token", expires_in: 3600 }),
        };
      }

      return { ok: false, status: 503, statusText: "Unavailable" };
    });

    mocks.createClients.mockResolvedValue({
      serverClient: {
        content: {
          v4: {
            audio: {
              verseRecitation: { byKey },
            },
          },
        },
      },
    });

    const result = await loadVerseAudio({} as never, "39:53");

    expect(result).toEqual({ audioUrl: "https://audio.example/39-53.mp3" });
    expect(byKey).toHaveBeenCalledWith("39:53", "7");
  });

  it("falls back to legacy audio.findVerseRecitationsByKey when HTTP fails", async () => {
    const findVerseRecitationsByKey = vi.fn(async () => ({
      audioFiles: [{ audioUrl: "https://audio.example/2-255.mp3" }],
    }));

    mocks.fetch.mockImplementation(async (url: string) => {
      if (String(url).includes("/oauth2/token")) {
        return {
          ok: true,
          json: async () => ({ access_token: "app-token", expires_in: 3600 }),
        };
      }

      return { ok: false, status: 503, statusText: "Unavailable" };
    });

    mocks.createClients.mockResolvedValue({
      serverClient: {
        content: { v4: {} },
        audio: { findVerseRecitationsByKey },
      },
    });

    const result = await loadVerseAudio({} as never, "2:255", 3);

    expect(result).toEqual({ audioUrl: "https://audio.example/2-255.mp3" });
    expect(findVerseRecitationsByKey).toHaveBeenCalledWith("2:255", "3");
  });

  it("loads via content HTTP without calling the SDK", async () => {
    mocks.createClients.mockRejectedValue(new Error("SDK should not be needed."));

    mocks.fetch.mockImplementation(async (url: string) => {
      if (String(url).includes("/oauth2/token")) {
        return {
          ok: true,
          json: async () => ({ access_token: "app-token", expires_in: 3600 }),
        };
      }

      return {
        ok: true,
        json: async () => ({
          audio_files: [{ url: "reciter/002255.mp3" }],
        }),
      };
    });

    const result = await loadVerseAudio({} as never, "2:255");

    expect(result).toEqual({
      audioUrl: "https://verses.quran.com/reciter/002255.mp3",
    });

    const audioCall = mocks.fetch.mock.calls.find((call) =>
      String(call[0]).includes("/content/api/v4/recitations/7/by_ayah/2%3A255"),
    );
    expect(audioCall).toBeTruthy();
    expect(audioCall?.[1]).toMatchObject({
      headers: {
        "x-auth-token": "app-token",
        "x-client-id": "client-id",
      },
    });
    expect(mocks.createClients).not.toHaveBeenCalled();
  });

  it("returns a friendly error instead of throwing", async () => {
    mocks.fetch.mockImplementation(async (url: string) => {
      if (String(url).includes("/oauth2/token")) {
        return {
          ok: true,
          json: async () => ({ access_token: "app-token", expires_in: 3600 }),
        };
      }

      return { ok: false, status: 502, statusText: "Bad Gateway" };
    });
    mocks.createClients.mockRejectedValue(new Error("SDK unavailable."));

    const result = await loadVerseAudio({} as never, "1:1");

    expect(result).toEqual({
      error: "Content audio request failed: 502 Bad Gateway",
    });
  });
});
