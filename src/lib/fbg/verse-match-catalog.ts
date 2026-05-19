/**
 * Local verse matching when Search API is unavailable or semantic snippets lack slip tokens.
 * Each gloss is a short English thematic summary for token overlap scoring.
 */

export const CATEGORY_VERSE_CANDIDATES: Record<string, string[]> = {
  Anger: ["41:34", "3:134", "42:37", "7:199", "49:12"],
  "Prayer Consistency": ["19:59", "2:238", "20:14", "70:23", "29:45"],
  Speech: ["49:12", "104:1", "24:19", "4:148", "53:32"],
  Honesty: ["9:119", "2:42", "3:61", "4:58", "16:92"],
  "Lower Gaze": ["24:30", "24:31", "23:5", "17:32", "70:29", "12:23"],
  "Mindful Time": ["63:9", "17:18", "70:19", "23:1", "103:3"],
  Contentment: ["4:32", "113:5", "94:5", "16:71", "20:131"],
  Gratitude: ["14:7", "31:12", "2:152", "55:13", "16:114"],
  Family: ["17:23", "46:15", "31:14", "4:36", "6:151"],
  "Self-Discipline": ["7:31", "2:168", "23:2", "7:33", "20:81"],
  Kindness: ["6:38", "16:5", "6:141", "55:10", "17:44", "21:47"],
  Reflection: ["39:53", "3:135", "25:70", "4:110", "12:87"],
};

/** English gloss per verse for local reranking (not shown to users). */
export const VERSE_THEME_GLOSS: Record<string, string> = {
  "3:134": "restrain anger pardon forgive control rage",
  "3:135": "avoid sin immorality wrong when angry repent",
  "4:32": "do not envy wish what others have contentment",
  "4:110": "whoever earns sin then seeks forgiveness find mercy",
  "6:38": "cattle beasts animals communities lessons creation",
  "6:141": "fruits livestock give due rights do not waste",
  "6:151": "kindness parents do good",
  "7:31": "eat drink but not excess wasteful",
  "7:199": "pardon overlook anger turn away",
  "9:119": "be with truthful honest people",
  "12:23": "she sought seduction he refused chastity prison",
  "12:87": "despair not mercy of Allah only disbelievers",
  "14:7": "if grateful I will increase blessings thanks",
  "16:5": "cattle creation signs for you benefit",
  "16:92": "do not break contracts oaths truth",
  "17:18": "whoever desires this fleeting life hasten",
  "17:23": "kindness to parents lower wing humility",
  "17:32": "do not approach adultery fornication immorality",
  "17:44": "creation heavens earth signs glorify",
  "19:59": "prayer descendants continuity worship",
  "2:152": "remember Me I remember you grateful",
  "2:168": "eat lawful good things do not follow evil",
  "2:238": "guard prayers especially middle prayer",
  "2:42": "do not mix truth falsehood conceal",
  "20:14": "establish prayer remember Me",
  "21:47": "just scales no wrong atom weight",
  "23:5": "guard private parts chastity",
  "24:19": "defame chaste women slander speech",
  "24:30": "lower gaze guard chastity modesty men",
  "24:31": "lower gaze guard chastity women modesty",
  "25:70": "repent believe do righteous deeds forgiven",
  "29:45": "recite scripture establish prayer",
  "31:12": "anyone grateful grateful for own soul",
  "39:53": "do not despair mercy Allah forgive all sins repent",
  "41:34": "repel evil with better enmity friend patience anger",
  "42:37": "avoid sin immorality when angry forgive",
  "46:15": "kindness parents bear me",
  "49:12": "avoid suspicion spying backbiting speech",
  "4:36": "be good to parents relatives orphans",
  "63:9": "do not let wealth children distract prayer",
  "70:19": "human created impatient when evil touches",
  "70:23": "those constant in prayer",
  "70:29": "guard private parts chastity except spouses",
  "103:1": "by time mankind is in loss",
  "104:1": "woe slanderer backbiting",
  "113:5": "envy when they envy",
  "16:71": "blessings of Allah do not envy",
  "55:10": "creatures on earth varying colors",
  "23:2": "successful believers humble prayer",
  "7:33": "say forbidden indecency sin aggression unjustly",
};

/** Extra slip patterns → category + richer search phrase (when Search scope works). */
export const getThematicSearchPhrase = (
  slipText: string,
  category: string,
  categoryQuery: (name: string) => string,
): string => {
  for (const rule of SLIP_THEME_RULES) {
    if (rule.pattern.test(slipText)) {
      return rule.searchPhrase;
    }
  }

  return categoryQuery(category);
};

export const SLIP_THEME_RULES: Array<{
  pattern: RegExp;
  category: string;
  searchPhrase: string;
}> = [
  {
    pattern: /\b(porn|pornography|hentai|xxx|nsfw|masturbat|fornicat|zina|adulter|lewd|explicit|nude|onlyfans)\b/i,
    category: "Lower Gaze",
    searchPhrase: "guard chastity lower gaze private parts",
  },
  {
    pattern: /\b(cat|cats|dog|dogs|animal|animals|pet|pets|cruel|abuse|abused|harm|hurt|shaved|killed|torture)\b/i,
    category: "Kindness",
    searchPhrase: "do not wrong creation animals kindness",
  },
  {
    pattern: /\b(drunk|alcohol|wine|beer|intoxicat|smok|vape|drugs|cocaine|weed|marijuana)\b/i,
    category: "Self-Discipline",
    searchPhrase: "intoxicants forbidden avoid harm",
  },
  {
    pattern: /\b(steal|stole|theft|shoplift|cheat|cheated|bribe)\b/i,
    category: "Honesty",
    searchPhrase: "do not consume wealth unjustly theft",
  },
];
