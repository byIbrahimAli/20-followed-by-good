export const FBG_THEME_STORAGE_KEY = "fbg-theme";

export const FBG_THEME_IDS = [
  "default",
  "warm-light",
  "warm-dark",
  "serenity-light",
  "serenity-dark",
] as const;

export type FbgThemeId = (typeof FBG_THEME_IDS)[number];

export interface FbgThemeOption {
  id: FbgThemeId;
  label: string;
  description: string;
  swatch: [string, string];
}

export const FBG_THEME_OPTIONS: FbgThemeOption[] = [
  {
    id: "default",
    label: "Default",
    description: "Emerald night — current app look",
    swatch: ["#131412", "#95d3ba"],
  },
  {
    id: "warm-light",
    label: "Warm Light",
    description: "Cream paper & gold accents",
    swatch: ["#f2f2eb", "#c5a059"],
  },
  {
    id: "warm-dark",
    label: "Warm Dark",
    description: "Evergreen ink & gold highlights",
    swatch: ["#1a1f16", "#c5a059"],
  },
  {
    id: "serenity-light",
    label: "Serenity Light",
    description: "Soft slate & ocean blue",
    swatch: ["#f0f4f8", "#2b7bb9"],
  },
  {
    id: "serenity-dark",
    label: "Serenity Dark",
    description: "Deep navy & teal calm",
    swatch: ["#0a192f", "#26a69a"],
  },
];

export const isFbgThemeId = (value: string): value is FbgThemeId =>
  FBG_THEME_IDS.includes(value as FbgThemeId);

export const getStoredFbgTheme = (): FbgThemeId => {
  if (typeof window === "undefined") {
    return "default";
  }

  try {
    const stored = window.localStorage.getItem(FBG_THEME_STORAGE_KEY);
    if (stored && isFbgThemeId(stored)) {
      return stored;
    }
  } catch {
    /* ignore */
  }

  return "default";
};

export const applyFbgTheme = (themeId: FbgThemeId): void => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute("data-fbg-theme", themeId);
};

export const persistFbgTheme = (themeId: FbgThemeId): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(FBG_THEME_STORAGE_KEY, themeId);
  } catch {
    /* ignore */
  }

  applyFbgTheme(themeId);
  window.dispatchEvent(new CustomEvent("fbg-theme-updated", { detail: themeId }));
};
