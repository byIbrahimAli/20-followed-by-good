import styles from "./fbg.module.css";

interface DiffFeedbackProps {
  expected: string;
  actual: string;
}

const tokenize = (value: string): string[] =>
  value.trim().split(/\s+/).filter(Boolean);

const normalizeToken = (token: string): string =>
  token.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export default function DiffFeedback({ expected, actual }: DiffFeedbackProps) {
  const expectedTokens = tokenize(expected);
  const actualTokens = tokenize(actual);

  if (actualTokens.length === 0) {
    return (
      <p className={styles.meta}>
        Type your recall above — matching words will highlight in green.
      </p>
    );
  }

  let matches = 0;
  for (let index = 0; index < actualTokens.length; index += 1) {
    const expectedToken = expectedTokens[index];
    if (
      expectedToken &&
      normalizeToken(expectedToken) === normalizeToken(actualTokens[index])
    ) {
      matches += 1;
    }
  }

  const coverage =
    expectedTokens.length > 0
      ? Math.round((matches / expectedTokens.length) * 100)
      : 0;

  return (
    <>
      <p className={styles.recallScore}>
        {matches} of {expectedTokens.length} words match ({coverage}%)
      </p>
      <div className={styles.card}>
        {actualTokens.map((token, index) => {
          const match =
            expectedTokens[index] &&
            normalizeToken(expectedTokens[index]) === normalizeToken(token);
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
            {expectedTokens.length - actualTokens.length} word(s) remaining in the
            translation
          </p>
        ) : null}
      </div>
    </>
  );
}
