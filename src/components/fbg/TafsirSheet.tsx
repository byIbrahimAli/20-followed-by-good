"use client";

import styles from "@/components/fbg/fbg.module.css";
import ui from "@/components/fbg/ui/ui.module.css";

interface TafsirSheetProps {
  onClose: () => void;
  text: string | null;
  loading: boolean;
  error: string | null;
}

export default function TafsirSheet({ onClose, text, loading, error }: TafsirSheetProps) {
  return (
    <div
      aria-labelledby="tafsir-sheet-title"
      aria-modal="true"
      className={styles.tafsirOverlay}
      role="dialog"
    >
      <button
        aria-label="Close tafsir"
        className={styles.tafsirBackdrop}
        onClick={onClose}
        type="button"
      />
      <div className={styles.tafsirSheet}>
        <div className={styles.tafsirSheetHeader}>
          <h2 className={styles.tafsirSheetTitle} id="tafsir-sheet-title">
            Tafsir
          </h2>
          <button
            aria-label="Close"
            className={styles.tafsirCloseBtn}
            onClick={onClose}
            type="button"
          >
            <span className={`${ui.materialIcon} ${ui.actionIcon}`}>close</span>
          </button>
        </div>
        <div className={styles.tafsirSheetBody}>
          {loading ? <p className={styles.meta}>Loading tafsir…</p> : null}
          {error ? <p className={styles.banner}>{error}</p> : null}
          {text
            ? text.split("\n\n").map((paragraph, index) => (
                <p className={styles.tafsirParagraph} key={index}>
                  {paragraph}
                </p>
              ))
            : null}
        </div>
      </div>
    </div>
  );
}
