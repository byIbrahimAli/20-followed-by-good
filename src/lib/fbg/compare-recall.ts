export const tokenizeRecall = (value: string): string[] =>
  value.trim().split(/\s+/).filter(Boolean);

export interface RecallComparison {
  actualTokens: string[];
  coveragePercent: number;
  expectedTokens: string[];
  matchCount: number;
  tokenMatches: boolean[];
}

export const compareRecall = (
  expected: string,
  actual: string,
  normalize: (token: string) => string = (token) =>
    token.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""),
): RecallComparison => {
  const expectedTokens = tokenizeRecall(expected);
  const actualTokens = tokenizeRecall(actual);

  const tokenMatches = actualTokens.map((token, index) => {
    const expectedToken = expectedTokens[index];
    if (!expectedToken) {
      return false;
    }
    return normalize(expectedToken) === normalize(token);
  });

  const matchCount = tokenMatches.filter(Boolean).length;
  const coveragePercent =
    expectedTokens.length > 0
      ? Math.round((matchCount / expectedTokens.length) * 100)
      : 0;

  return {
    actualTokens,
    coveragePercent,
    expectedTokens,
    matchCount,
    tokenMatches,
  };
};
