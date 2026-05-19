"use client";

import { DemoInteractRow } from "@/components/fbg/DemoInteract";
import ui from "@/components/fbg/ui/ui.module.css";

import c from "./community.module.css";

const ROWS: Array<{
  rank: number;
  initials: string;
  name: string;
  score: number;
  avatarClass: string;
  rankClass?: string;
  highlight?: boolean;
}> = [
  { rank: 1, initials: "YA", name: "Yusuf A.", score: 31, avatarClass: c.avatarYa, rankClass: c.rankFirst },
  { rank: 2, initials: "HK", name: "Hassan K.", score: 27, avatarClass: c.avatarHk },
  { rank: 3, initials: "You", name: "You", score: 23, avatarClass: c.avatarYou, rankClass: c.rankYou, highlight: true },
  { rank: 4, initials: "IM", name: "Ibrahim M.", score: 19, avatarClass: c.avatarIm },
];

export default function CircleLeaderboardCard() {
  return (
    <article className={c.card}>
      <h2 className={c.cardTitle}>Maghrib Circle · 6 members</h2>
      <p className={c.cardSubtitle}>Ranked by ayat held this month</p>

      <div>
        {ROWS.map((row) => (
          <DemoInteractRow
            className={`${c.leaderboardRow} ${row.highlight ? c.leaderboardRowHighlight : ""}`}
            key={row.rank}
          >
            <span className={`${c.rank} ${row.rankClass ?? ""}`}>{row.rank}</span>
            <span className={`${c.avatar} ${row.avatarClass}`}>{row.initials}</span>
            <span className={c.memberName}>{row.name}</span>
            <span className={c.score}>{row.score}</span>
          </DemoInteractRow>
        ))}
      </div>

      <p className={c.privacyNote}>
        <span className={ui.materialIcon} aria-hidden>
          lock
        </span>
        Only good deeds are shared. What slipped is never visible to anyone.
      </p>
    </article>
  );
}
