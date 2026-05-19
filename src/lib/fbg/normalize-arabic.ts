/** Strip harakat, tatweel, and unify common letter variants for recall comparison. */
export const normalizeArabic = (text: string): string =>
  text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06ED]/g, "")
    .replace(/\u0640/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
