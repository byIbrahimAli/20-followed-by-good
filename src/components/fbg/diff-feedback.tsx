import styles from "./fbg.module.css";

interface DiffFeedbackProps {
  expected: string;
  actual: string;
}

const tokenize = (value: string): string[] =>
  value.trim().split(/\s+/).filter(Boolean);

export default function DiffFeedback({ expected, actual }: DiffFeedbackProps) {
  const expectedTokens = tokenize(expected);
  const actualTokens = tokenize(actual);

  if (actualTokens.length === 0) {
    return (
      <p className={styles.meta}>Type or recite the ayah to see feedback.</p>
    );
  }

  return (
    <div className={styles.card}>
      {actualTokens.map((token, index) => {
        const match = expectedTokens[index]?.toLowerCase() === token.toLowerCase();
        return (
          <span
            className={match ? styles.diffLineMatch : styles.diffLineMiss}
            key={`${token}-${index}`}
          >
            {token}{" "}
          </span>
        );
      })}
      {actualTokens.length < expectedTokens.length ? (
        <p className={styles.meta}>
          {expectedTokens.length - actualTokens.length} word(s) remaining
        </p>
      ) : null}
    </div>
  );
}
