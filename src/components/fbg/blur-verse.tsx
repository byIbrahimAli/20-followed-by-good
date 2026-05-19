"use client";

import BlurRevealText from "@/components/fbg/BlurRevealText";
import styles from "@/components/fbg/fbg.module.css";

interface BlurVerseProps {
  text: string;
  revealedAll?: boolean;
}

export default function BlurVerse({ text, revealedAll = false }: BlurVerseProps) {
  return (
    <BlurRevealText
      className={styles.arabic}
      dir="rtl"
      revealedAll={revealedAll}
      text={text}
    />
  );
}
