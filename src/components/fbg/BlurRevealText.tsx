"use client";

import { useMemo } from "react";

import styles from "./fbg.module.css";

interface BlurRevealTextProps {
  text: string;
  className?: string;
  dir?: "rtl" | "ltr" | "auto";
  /** When set, all words follow this state (used with reveal buttons). */
  revealedAll?: boolean;
}

export default function BlurRevealText({
  text,
  className,
  dir = "auto",
  revealedAll = false,
}: BlurRevealTextProps) {
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);

  return (
    <p className={className} dir={dir}>
      {words.map((word, index) => (
        <span
          className={`${styles.blurWord} ${revealedAll ? styles.blurWordRevealed : ""}`}
          key={`${word}-${index}`}
        >
          {word}
        </span>
      ))}
    </p>
  );
}
