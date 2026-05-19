import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClients: vi.fn(),
}));

vi.mock("@/lib/sdk", () => ({
  createClients: mocks.createClients,
}));

import { extractTafsirText, loadTafsir, stripHtml } from "@/lib/fbg/load-tafsir";

describe("stripHtml", () => {
  it("removes tags and decodes basic entities", () => {
    expect(stripHtml("<p>Hello <strong>world</strong>&nbsp;!</p>")).toBe(
      "Hello world !",
    );
  });

  it("converts br tags to newlines", () => {
    expect(stripHtml("Line one<br/>Line two")).toBe("Line one\nLine two");
  });
});

describe("extractTafsirText", () => {
  it("reads tafsir from verse payload", () => {
    const text = extractTafsirText({
      verse: {
        tafsirs: [{ text: "<p>Meaning of the ayah.</p>" }],
      },
    });
    expect(text).toBe("Meaning of the ayah.");
  });

  it("reads tafsir from by_ayah payload", () => {
    const text = extractTafsirText({
      tafsir: { text: "<p>Grouped tafsir block.</p>" },
    });
    expect(text).toBe("Grouped tafsir block.");
  });
});

describe("loadTafsir", () => {
  beforeEach(() => {
    mocks.createClients.mockResolvedValue({
      serverClient: {
        content: {
          v4: {
            verses: {
              byKey: vi.fn(async () => ({
                verse: {
                  tafsirs: [{ text: "Tafsir text for this ayah." }],
                },
              })),
            },
          },
        },
      },
    });
  });

  it("returns stripped tafsir text", async () => {
    const result = await loadTafsir({}, "39:53");
    expect(result).toEqual({ text: "Tafsir text for this ayah." });
  });

  it("returns error when tafsir is missing", async () => {
    mocks.createClients.mockResolvedValue({
      serverClient: {
        content: {
          v4: {
            verses: {
              byKey: vi.fn(async () => ({ verse: { tafsirs: [] } })),
            },
          },
        },
      },
    });

    const result = await loadTafsir({}, "39:53");
    expect(result).toEqual({ error: "Tafsir not available for this verse." });
  });
});
