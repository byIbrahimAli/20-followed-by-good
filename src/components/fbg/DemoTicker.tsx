"use client";

import { useEffect, useState } from "react";

import { DEMO_BANNER_PULSE_EVENT } from "@/lib/fbg/demo-banner-pulse";

import styles from "./fbg.module.css";

const TICKER_SEGMENT = "DEMO · ";
const TICKER_COPIES = 16;
const TICKER_TEXT = TICKER_SEGMENT.repeat(TICKER_COPIES);

export default function DemoTicker() {
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    const onPulse = () => {
      setPulsing(true);
      window.setTimeout(() => setPulsing(false), 700);
    };

    window.addEventListener(DEMO_BANNER_PULSE_EVENT, onPulse);
    return () => window.removeEventListener(DEMO_BANNER_PULSE_EVENT, onPulse);
  }, []);

  return (
    <div
      aria-hidden
      className={`${styles.demoTicker} ${pulsing ? styles.demoTickerPulse : ""}`}
    >
      <div className={styles.demoTickerTrack}>
        <span className={styles.demoTickerText}>{TICKER_TEXT}</span>
        <span className={styles.demoTickerText}>{TICKER_TEXT}</span>
      </div>
    </div>
  );
}
