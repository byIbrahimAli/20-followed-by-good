export interface ReflectionQuote {
  id: string;
  title: string;
  body: string;
}

export const REFLECTION_QUOTES: ReflectionQuote[] = [
  {
    id: "grave-consequences",
    title: "Realise the Grave Consequences of Sinning",
    body: `The Messenger of Allah ﷺ said, “Indeed, when the servant commits a sin, a black dot appears on his heart. When he desists, seeks forgiveness and repents, his heart is polished clean. But if he commits a sin again, it increases until it covers his heart. And that is the ‘rān’ (rust) which Allah mentioned, ‘No indeed! Rather what they have been doing has rusted their hearts (83:14)’” (Tirmidhī).`,
  },
  {
    id: "never-belittle",
    title: "Never Belittle a Sin",
    body: `The Messenger of Allah ﷺ said, “Beware of sins which are deemed as insignificant because indeed they gather on a person until they destroy him” (Aḥmad).

‘Abdullah ibn Mas‘ūd (raḍiy Allāhu ‘anhu) said, “The believer regards his sin equivalent to a mountain, beneath which he is seated, and fears that it will collapse on him; whilst the sinner regards his sin to be equivalent to a fly which lands on his nose and he swats it away.”

‘Don’t look at any sin as being insignificant. Rather, look at the greatness of the One you disobeyed.’ – Bilāl b. Saʿīd (raḥimahullāh)`,
  },
  {
    id: "stop-sinning",
    title: "Stop Sinning and Resolve to Never Repeat the Sin",
    body: `Al-Fudhayl (raḥimahullāh) said, “Asking for forgiveness without abandoning sin is the repentance of liars.”`,
  },
  {
    id: "regret-sins",
    title: "Regret Your Sins and Cry Over Them",
    body: `The Messenger of Allah ﷺ said, “Regret is repentance” (Ibn Mājah).

‘People! Your hearts are essentially pure, but they have been stained with splashes of sins. So splash on them in turn the tears of your eyes and you will find your hearts purified.’ – Ibn Rajab (raḥimahullāh)

Ibn al-Qayyim (raḥimahullāh) said, “The pleasure one feels at sinning is more harmful than the sin itself. A believer never enjoys the fruit of his sins, but rather feels a remorseful ache within him. If this ceases to occur, and the joy of sinning overpowers any feeling of remorse, then that is a sign of a dead heart. To rectify this situation, one must do the following three things:

Fear dying in such a state before having the chance to repent
Regret over what one missed out on by disobeying Allah
Work very hard to atone for the sin and to avoid it in the future.”`,
  },
  {
    id: "wudu-prayer",
    title: "Perform Wudu’ and Pray Two Rakʿahs",
    body: `The Messenger of Allah ﷺ said, “When a servant commits a sin, and he performs wuḍū’ well, and then stands and prays two rakʿahs, and asks forgiveness from Allah, Allah forgives him” (Abū Dāwūd).`,
  },
  {
    id: "good-erases-bad",
    title: "Follow Any Bad With Good and Atone for Your Sins",
    body: `Allah (subḥānahū wa taʿālā) said, “Indeed good deeds erase bad deeds” (11:114). If one has wronged another person, one should atone for the sin e.g. ask their forgiveness or supplicate for them.`,
  },
  {
    id: "best-time",
    title: "Seek Forgiveness During the Best Time",
    body: `The Messenger of Allah ﷺ said, “Our Lord – Glorified and Exalted is He – descends every night to the lowest heaven when one-third of the night remains and says, ‘Who will call upon Me, that I may answer Him? Who will ask of Me, that I may give him? Who will seek My forgiveness, that I may forgive him?’” (Bukhārī).`,
  },
  {
    id: "best-manner",
    title: "Seek Forgiveness in the Best Manner",
    body: `اَللّٰهُمَّ أَنْتَ رَبِّيْ لَا إِلٰهَ إِلَّا أَنْتَ ، خَلَقْتَنِيْ وَأَنَا عَبْدُكَ ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ ، أَعُوْذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ ، أَبُوْءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوْءُ لَكَ بِذَنْبِيْ ، فَاغْفِرْ لِيْ فَإِنَّهُ لَا يَغْفِرُ الذُّنُوْبَ إِلَّا أَنْتَ

O Allah, You are my Lord. There is no god worthy of worship except You. You have created me, and I am Your slave, and I am under Your covenant and pledge (to fulfil it) to the best of my ability. I seek Your protection from the evil that I have done. I acknowledge the favours that You have bestowed upon me, and I admit my sins. Forgive me, for none forgives sins but You.

Shaddād b. Aws (raḍiy Allāhu ʿanhu) narrates that the Messenger of Allah ﷺ said: “The most superior manner of seeking forgiveness is that you say [the above]. Whoever says it during the day with firm belief in it and dies on the same day before the evening, he will be from the people of Paradise. And whoever says it during the night with firm belief in it and dies before the morning, he will be from the people of Paradise.” (Bukhārī 6306)`,
  },
  {
    id: "constant-repentance",
    title: "Make Repentance Your Constant Companion",
    body: `Allah (subḥānahū wa taʿālā) said, “Indeed, Allah loves those who are constantly repentant and loves those who purify themselves” (2:222). The Messenger of Allah ﷺ said: “Whoever wants to be pleased with his scroll of deeds should increase in seeking forgiveness” (Tabarānī).

‘The state of tawbah is at the beginning, the middle and the end of the slave’s journey to his Creator. The servant who seeks the pleasure of Allah never abandons tawbah. He remains in the state of tawbah until his death.’ – Ibn al-Qayyim (raḥimahullāh)`,
  },
  {
    id: "forgive-others",
    title: "Seek Forgiveness for Others",
    body: `The Messenger of Allah ﷺ said, “Whoever seeks forgiveness for every male and female believer, Allah will record a good deed for him for every male and female believer” (Tabarānī).`,
  },
];

export const pickRandomQuote = (): ReflectionQuote => {
  const index = Math.floor(Math.random() * REFLECTION_QUOTES.length);
  return REFLECTION_QUOTES[index] ?? REFLECTION_QUOTES[0];
};
