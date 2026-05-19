import styles from "./fbg.module.css";
import { compareRecall } from "@/lib/fbg/compare-recall";

interface DiffFeedbackProps {
  expected: string;
  actual: string;
  dir?: "ltr" | "rtl" | "auto";
  emptyHint?: string;
  normalize?: (token: string) => string;
  remainingLabel?: string;
  scoreLabel?: string;
}

export default function DiffFeedback({
  expected,
  actual,
  dir = "ltr",
  emptyHint = "Type your recall above — matching words will highlight in green.",
  normalize,
  remainingLabel = "translation",
  scoreLabel = "words",
}: DiffFeedbackProps) {
  const comparison = compareRecall(expected, actual, normalize);

  if (comparison.actualTokens.length === 0) {
    return <p className={styles.meta}>{emptyHint}</p>;
  }

  return (
    <>
      <p className={styles.recallScore}>
        {comparison.matchCount} of {comparison.expectedTokens.length} {scoreLabel}{" "}
        match ({comparison.coveragePercent}%)
      </p>
      <div className={styles.card} dir={dir}>
        {comparison.actualTokens.map((token, index) => (
          <span
            className={
              comparison.tokenMatches[index]
                ? styles.diffLineMatch
                : styles.diffLineMiss
            }
            key={`${token}-${index}`}
          >
            {token}{" "}
          </span>
        ))}
        {comparison.actualTokens.length < comparison.expectedTokens.length ? (
          <p className={styles.meta}>
            {comparison.expectedTokens.length - comparison.actualTokens.length}{" "}
            word(s) remaining in the {remainingLabel}
          </p>
        ) : null}
      </div>
    </>
  );
}
