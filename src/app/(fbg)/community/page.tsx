"use client";

import Link from "next/link";

import styles from "@/components/fbg/fbg.module.css";
import TopAppBar from "@/components/fbg/ui/TopAppBar";
import ui from "@/components/fbg/ui/ui.module.css";

const LEADERBOARD = [
  { name: "Yusuf A.", streak: 12, reviews: 48 },
  { name: "Maryam K.", streak: 9, reviews: 36 },
  { name: "Omar H.", streak: 7, reviews: 29 },
  { name: "You", streak: 3, reviews: 11, highlight: true },
];

export default function CommunityPage() {
  return (
    <>
      <TopAppBar title="Community" />

      <p className={styles.pageLead}>
        Accountability without shame — preview data for the hackathon demo.
      </p>

      <section className={ui.bentoGrid}>
        <article className={`${ui.bentoCard} ${ui.bentoWide}`}>
          <p className={ui.bentoLabel}>Your sahib</p>
          <p style={{ fontSize: "0.95rem" }}>
            Yusuf is on a 12-day streak. Send a nudge after your next review.
          </p>
          <button className={styles.secondaryButton} type="button">
            Send encouragement
          </button>
        </article>
      </section>

      <p className={ui.sectionLabel}>Maghrib circle leaderboard</p>
      <ul style={{ listStyle: "none" }}>
        {LEADERBOARD.map((row) => (
          <li
            className={ui.bentoCard}
            key={row.name}
            style={{
              marginBottom: "0.5rem",
              borderColor: row.highlight ? "var(--fbg-primary)" : undefined,
            }}
          >
            <strong>{row.name}</strong>
            <p className={styles.meta}>
              {row.streak} day streak · {row.reviews} reviews
            </p>
          </li>
        ))}
      </ul>

      <Link className={styles.meta} href="/">
        ← Back to home
      </Link>
    </>
  );
}
