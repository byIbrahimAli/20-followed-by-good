"use client";

import { useEffect, useId, useRef, useState } from "react";

import ThemeIcon from "@/components/fbg/ThemeIcon";
import ui from "@/components/fbg/ui/ui.module.css";
import {
  FBG_THEME_OPTIONS,
  getStoredFbgTheme,
  persistFbgTheme,
  type FbgThemeId,
} from "@/lib/fbg/themes";

interface ProfileMenuProps {
  label?: string;
}

export default function ProfileMenu({ label = "Change theme" }: ProfileMenuProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [themeId, setThemeId] = useState<FbgThemeId>("default");

  useEffect(() => {
    setThemeId(getStoredFbgTheme());
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectTheme = (next: FbgThemeId) => {
    persistFbgTheme(next);
    setThemeId(next);
    setOpen(false);
  };

  return (
    <div className={ui.profileMenuRoot} ref={rootRef}>
      <button
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        className={ui.themeMenuBtn}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <ThemeIcon className={ui.themeMenuIcon} />
      </button>

      {open ? (
        <div className={ui.profileMenuPanel} id={menuId} role="menu">
          <p className={ui.profileMenuHeading}>Theme</p>
          <ul className={ui.themeOptionList}>
            {FBG_THEME_OPTIONS.map((option) => {
              const active = option.id === themeId;
              return (
                <li key={option.id}>
                  <button
                    className={
                      active ? ui.themeOptionBtnActive : ui.themeOptionBtn
                    }
                    onClick={() => selectTheme(option.id)}
                    role="menuitemradio"
                    aria-checked={active}
                    type="button"
                  >
                    <span className={ui.themeSwatch} aria-hidden>
                      <span
                        className={ui.themeSwatchTone}
                        style={{ background: option.swatch[0] }}
                      />
                      <span
                        className={ui.themeSwatchAccent}
                        style={{ background: option.swatch[1] }}
                      />
                    </span>
                    <span className={ui.themeOptionCopy}>
                      <span className={ui.themeOptionLabel}>{option.label}</span>
                      <span className={ui.themeOptionDesc}>{option.description}</span>
                    </span>
                    {active ? (
                      <span className={`${ui.materialIcon} ${ui.themeOptionCheck}`}>
                        check
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
