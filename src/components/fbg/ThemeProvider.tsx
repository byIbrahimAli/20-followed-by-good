"use client";

import { useLayoutEffect } from "react";

import { applyFbgTheme, getStoredFbgTheme, type FbgThemeId } from "@/lib/fbg/themes";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  useLayoutEffect(() => {
    applyFbgTheme(getStoredFbgTheme());

    const onThemeUpdated = (event: Event) => {
      const detail = (event as CustomEvent<FbgThemeId>).detail;
      if (detail) {
        applyFbgTheme(detail);
      }
    };

    window.addEventListener("fbg-theme-updated", onThemeUpdated);
    return () => window.removeEventListener("fbg-theme-updated", onThemeUpdated);
  }, []);

  return children;
}
