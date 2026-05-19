export const CATEGORY_QUERIES: Record<string, string> = {
  Anger: "restrain anger",
  "Prayer Consistency": "establish prayer",
  Speech: "backbiting",
  Honesty: "truthfulness",
  "Lower Gaze": "lower your gaze",
  "Mindful Time": "waste not time",
  Contentment: "do not envy",
  Gratitude: "be grateful",
  Family: "parents kindness",
  "Self-Discipline": "eat and drink",
  Kindness: "do not wrong creation kindness animals",
  Reflection: "repentance mercy",
};

export const CATEGORY_FALLBACK_VERSE: Record<string, string> = {
  Anger: "49:12",
  "Prayer Consistency": "19:59",
  Speech: "49:12",
  Honesty: "9:119",
  "Lower Gaze": "24:30",
  "Mindful Time": "103:1",
  Contentment: "4:32",
  Gratitude: "14:7",
  Family: "17:23",
  "Self-Discipline": "7:31",
  Kindness: "6:38",
  Reflection: "39:53",
};

export const MOCK_TAFSIR: Record<string, string> = {
  Anger: "Allah praises those who restrain anger and pardon others — mastery begins in the moment before words escape.",
  "Prayer Consistency": "Prayer anchors the day; missing it unsettles the heart more than we admit.",
  Speech: "The tongue can build or wound; guarding speech is half of faith.",
  Honesty: "Truthfulness clears the heart and invites barakah in relationships.",
  "Lower Gaze": "Lowering the gaze protects the heart from attachments that dilute remembrance.",
  "Mindful Time": "Time is a trust; squandering it is a quiet form of ingratitude.",
  Contentment: "Looking at what others have breeds unrest; gratitude steadies the soul.",
  Gratitude: "Increase in thanks opens increase in provision and peace.",
  Family: "Kindness to parents is among the deeds most beloved after tawhid.",
  "Self-Discipline": "Moderation in consumption trains the nafs for higher obedience.",
  Kindness:
    "Creation is a trust; harming animals without need hardens the heart away from mercy.",
  Reflection: "No sin outruns His mercy when repentance is sincere.",
};

export const REFLECTION_PROMPTS: Record<string, string> = {
  Anger: "What triggered you, and what would a restrained response look like next time?",
  "Prayer Consistency": "What one barrier stopped prayer, and what small change removes it tomorrow?",
  Speech: "Who was affected by your words, and how can you repair or restrain tomorrow?",
  Honesty: "Where was truth compromised, and what truth will you speak today?",
  "Lower Gaze": "What cue led the gaze, and what boundary will you set before the cue appears?",
  "Mindful Time": "What pulled you away, and what five-minute substitute will you try instead?",
  Contentment: "Whose blessing stirred envy, and what gratitude can you voice aloud?",
  Gratitude: "Name three gifts from today you overlooked.",
  Family: "What small act of kindness can you offer a parent or elder today?",
  "Self-Discipline": "Where did appetite win, and what limit will you hold gently tomorrow?",
  Kindness:
    "What harm was done, and how can you show care for Allah's creation tomorrow?",
  Reflection: "What is one sincere dua you can make before sleep tonight?",
};

export const getCategoryQuery = (category: string): string =>
  CATEGORY_QUERIES[category] ?? category;

export const getFallbackVerseKey = (category: string): string =>
  CATEGORY_FALLBACK_VERSE[category] ?? "39:53";

export const getMockTafsir = (category: string): string =>
  MOCK_TAFSIR[category] ?? MOCK_TAFSIR.Reflection;

export const getReflectionPrompt = (category: string): string =>
  REFLECTION_PROMPTS[category] ?? REFLECTION_PROMPTS.Reflection;

export interface DemoVerse {
  verseKey: string;
  surahName: string;
  ayahNumber: number;
  arabicText: string;
  translationText: string;
}

/** Curated demo verses when Reader API returns empty (prelive). */
export const DEMO_VERSES: Record<string, DemoVerse> = {
  "41:34": {
    verseKey: "41:34",
    surahName: "Fussilat",
    ayahNumber: 34,
    arabicText:
      "وَلَا تَسْتَوِي الْحَسَنَةُ وَلَا السَّيِّئَةُ ۚ ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ فَإِذَا الَّذِي بَيْنَكَ وَبَيْنَهُ عَدَاوَةٌ كَأَنَّهُ وَلِيٌّ حَمِيمٌ",
    translationText:
      "Good and evil are not equal. Repel evil with what is better, and your enemy may become as a devoted friend.",
  },
  "49:12": {
    verseKey: "49:12",
    surahName: "Al-Hujurat",
    ayahNumber: 12,
    arabicText:
      "يَا أَيُّهَا الَّذِينَ آمَنُوا اجْتَنِبُوا كَثِيرًا مِّنَ الظَّنِّ إِنَّ بَعْضَ الظَّنِّ إِثْمٌ ۖ وَلَا تَجَسَّسُوا وَلَا يَغْتَب بَّعْضُكُم بَعْضًا",
    translationText:
      "O you who believe, avoid much suspicion. Indeed, some suspicion is sin. And do not spy or backbite one another.",
  },
  "39:53": {
    verseKey: "39:53",
    surahName: "Az-Zumar",
    ayahNumber: 53,
    arabicText:
      "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ",
    translationText:
      "Say: O My servants who have transgressed against themselves, do not despair of the mercy of Allah.",
  },
  "24:30": {
    verseKey: "24:30",
    surahName: "An-Nur",
    ayahNumber: 30,
    arabicText: "قُل لِّلْمُؤْمِنِينَ يَغُضُّوا مِنْ أَبْصَارِهِمْ",
    translationText: "Tell the believing men to lower their gaze.",
  },
  "103:1": {
    verseKey: "103:1",
    surahName: "Al-Asr",
    ayahNumber: 1,
    arabicText: "وَالْعَصْرِ",
    translationText: "By time.",
  },
};

export const getDemoVerseForCategory = (category: string): DemoVerse => {
  const key = getFallbackVerseKey(category);
  return DEMO_VERSES[key] ?? DEMO_VERSES["39:53"];
};
