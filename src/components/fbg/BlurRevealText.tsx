"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    if (revealedAll) {
      setRevealedIndices(new Set(words.map((_, index) => index)));
      return;
    }
    setRevealedIndices(new Set());
  }, [revealedAll, words]);

  const toggleWord = (index: number) => {
    if (revealedAll) {
      return;
    }
    setRevealedIndices((previous) => {
      const next = new Set(previous);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <p className={className} dir={dir}>
      {words.map((word, index) => {
        const isRevealed = revealedAll || revealedIndices.has(index);
        return (
          <button
            className={`${styles.blurWord} ${isRevealed ? styles.blurWordRevealed : ""}`}
            disabled={revealedAll}
            key={`${word}-${index}`}
            onClick={() => toggleWord(index)}
            type="button"
          >
            {word}
          </button>
        );
      })}
    </p>
  );
}
