"use client";

import { useMemo, useState } from "react";

import styles from "./fbg.module.css";

interface BlurVerseProps {
  text: string;
  revealAll?: boolean;
}

export default function BlurVerse({ text, revealAll = false }: BlurVerseProps) {
  const words = useMemo(
    () => text.split(/\s+/).filter(Boolean),
    [text],
  );
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const allRevealed = revealAll || revealed.size >= words.length;

  return (
    <p className={styles.arabic} dir="rtl">
      {words.map((word, index) => {
        const isRevealed = allRevealed || revealed.has(index);
        return (
          <span
            className={`${styles.blurWord} ${isRevealed ? styles.blurWordRevealed : ""}`}
            key={`${word}-${index}`}
            onClick={() => {
              if (revealAll) {
                return;
              }
              setRevealed((prev) => new Set(prev).add(index));
            }}
            role="button"
            tabIndex={0}
          >
            {word}
          </span>
        );
      })}
    </p>
  );
}
