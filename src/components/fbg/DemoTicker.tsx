import styles from "./fbg.module.css";

const TICKER_SEGMENT = "DEMO · ";
const TICKER_COPIES = 16;
const TICKER_TEXT = TICKER_SEGMENT.repeat(TICKER_COPIES);

export default function DemoTicker() {
  return (
    <div aria-hidden className={styles.demoTicker}>
      <div className={styles.demoTickerTrack}>
        <span className={styles.demoTickerText}>{TICKER_TEXT}</span>
        <span className={styles.demoTickerText}>{TICKER_TEXT}</span>
      </div>
    </div>
  );
}
