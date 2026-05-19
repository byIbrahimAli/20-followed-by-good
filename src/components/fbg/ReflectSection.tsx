"use client";

import { useMemo } from "react";

import styles from "@/components/fbg/fbg.module.css";
import ui from "@/components/fbg/ui/ui.module.css";
import { pickRandomQuote } from "@/lib/fbg/reflection-quotes";

export default function ReflectSection() {
  const quote = useMemo(() => pickRandomQuote(), []);

  return (
    <>
      <hr className={ui.reflectDivider} />
      <p className={ui.sectionLabel}>Reflect</p>
      <div className={styles.reflectQuote}>
        {quote.body.split("\n\n").map((paragraph, index) => (
          <p key={`${quote.id}-${index}`}>{paragraph}</p>
        ))}
      </div>
    </>
  );
}
