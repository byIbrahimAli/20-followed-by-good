import styles from "./fbg.module.css";

export interface AyahCardProps {
  verseKey: string;
  surahName: string;
  ayahNumber: number;
  arabicText: string;
  translationText: string;
  tafsirSnippet: string;
  reflectionPrompt: string;
  category?: string;
}

export default function AyahCard({
  verseKey,
  surahName,
  ayahNumber,
  arabicText,
  translationText,
  tafsirSnippet,
  reflectionPrompt,
  category,
}: AyahCardProps) {
  return (
    <article className={styles.card}>
      {category ? <span className={styles.pill}>{category}</span> : null}
      <p className={styles.meta}>
        {surahName} · {verseKey} · Ayah {ayahNumber}
      </p>
      <p className={styles.arabic}>{arabicText}</p>
      <p className={styles.translation}>{translationText}</p>
      <p className={styles.tafsir}>{tafsirSnippet}</p>
      <p className={styles.meta}>
        <strong>Reflect:</strong> {reflectionPrompt}
      </p>
    </article>
  );
}
