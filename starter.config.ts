export const starterConfig = {
  app: {
    description:
      "Turn slips into restorative Quran-backed habits — log, receive an ayah, memorize, and grow.",
    name: "Followed By Good",
    shortName: "FBG",
  },
  branding: {
    accent: "#40916c",
    background: "#1a1f1e",
    card: "#232a28",
    text: "#f0f4f2",
  },
  defaults: {
    chapterId: "1",
    mushafId: 4,
    searchPlaceholder: "Search a verse, surah, or phrase",
  },
  features: {
    collections: true,
    goals: true,
    notes: true,
    reflections: true,
    search: true,
  },
} as const;

export type StarterConfig = typeof starterConfig;
