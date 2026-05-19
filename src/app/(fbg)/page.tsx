"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import styles from "@/components/fbg/fbg.module.css";
import Chip from "@/components/fbg/ui/Chip";
import GlassCard from "@/components/fbg/ui/GlassCard";
import ReviewCard from "@/components/fbg/ui/ReviewCard";
import TopAppBar from "@/components/fbg/ui/TopAppBar";
import ui from "@/components/fbg/ui/ui.module.css";
import { continueToAyah } from "@/lib/fbg/recovery-actions";
import { computeRetentionPercent } from "@/lib/fbg/srs";
import { getTaxonomyChips } from "@/lib/fbg/slip-taxonomy";
import {
  getRecentCategories,
  getStore,
  isDueTodayOrEarlier,
  todayIso,
  toggleIntention,
  type Intention,
} from "@/lib/fbg/store";
import { useStoreSync } from "@/lib/fbg/use-store-sync";
import type { BootstrapPayload } from "@/lib/types";

const fetchBootstrap = async (): Promise<BootstrapPayload> => {
  const response = await fetch("/api/bootstrap", { credentials: "include" });
  return response.json();
};

const ERROR_CHIPS = new Set(["Lost my temper", "Spoke harshly"]);

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const { assignments, sessions } = useStoreSync();
  const { data: bootstrap } = useSWR("fbg-bootstrap", fetchBootstrap);

  const chips = getTaxonomyChips(getRecentCategories());

  useEffect(() => {
    setIntentions(getStore().intentions);
    const q = searchParams.get("q");
    if (q) {
      setText(q);
    }
  }, [searchParams]);

  const reviewItems = useMemo(() => {
    const dueSessions = sessions.filter((session) =>
      isDueTodayOrEarlier(session.nextDue),
    );
    const pendingAssignments = assignments.filter(
      (item) => item.status === "pending" || item.status === "memorizing",
    );

    return [
      ...dueSessions.map((session) => ({
        href: `/memorize/${session.id}`,
        id: session.id,
        percent: computeRetentionPercent(session.intervalIndex),
        subtitle: `${session.surahName} · ${session.verseKey}`,
        title: "SRS review due",
        arabicSnippet: session.arabicText,
      })),
      ...pendingAssignments.slice(0, 3).map((item) => ({
        href: `/recover/assign?id=${item.id}`,
        id: item.id,
        percent: item.status === "memorizing" ? 40 : 10,
        subtitle: item.verseKey,
        title: item.category,
        arabicSnippet: item.arabicText,
      })),
    ];
  }, [assignments, sessions]);

  const handleContinue = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const assignment = await continueToAyah(trimmed);
      router.push(`/recover/assign?id=${assignment.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not assign ayah.");
    } finally {
      setLoading(false);
    }
  };

  const appendChip = (chip: string) => {
    setText((prev) => (prev ? `${prev} ${chip}` : chip));
  };

  const handleToggleIntention = (id: string) => {
    toggleIntention(id);
    setIntentions(getStore().intentions);
  };

  return (
    <>
      <TopAppBar title="Followed By Good" />

      <GlassCard id="moment">
        <p className={ui.sectionLabel}>What slipped today?</p>
        <textarea
          className={ui.slipTextarea}
          onChange={(event) => setText(event.target.value)}
          placeholder="Name it gently — no shame, just honesty…"
          value={text}
        />
        <div className={ui.chipRow}>
          {chips.map((chip) => (
            <Chip
              key={chip}
              label={chip}
              onClick={() => appendChip(chip)}
              variant={ERROR_CHIPS.has(chip) ? "error" : "neutral"}
            />
          ))}
        </div>
        <p className={ui.hadithQuote}>
          “The strong is not the one who overcomes people by his strength, but the
          strong is the one who controls himself while in anger.” — Bukhari
        </p>
        {error ? <p className={styles.banner}>{error}</p> : null}
        <button
          className={ui.primaryGradient}
          disabled={loading || !text.trim()}
          onClick={handleContinue}
          type="button"
        >
          {loading ? "Finding your ayah…" : "Continue"}
        </button>
      </GlassCard>

      <section style={{ marginBottom: "var(--fbg-section-gap)" }}>
        <p className={ui.sectionLabel}>In review</p>
        {reviewItems.length === 0 ? (
          <p className={styles.meta}>
            Nothing due yet. Log a slip above or use{" "}
            <Link href="/?demo=1">demo data</Link>.
          </p>
        ) : (
          <div className={ui.reviewScroller}>
            {reviewItems.map((item) => (
              <ReviewCard
                arabicSnippet={item.arabicSnippet}
                href={item.href}
                key={item.id}
                percent={item.percent}
                subtitle={item.subtitle}
                title={item.title}
              />
            ))}
          </div>
        )}
      </section>

      <section className={ui.bentoGrid}>
        <article className={`${ui.bentoCard} ${ui.bentoWide}`}>
          <p className={ui.bentoLabel}>Sahib in Deen</p>
          <p style={{ fontSize: "0.9rem" }}>
            Yusuf completed his morning review — send a quiet encouragement.
          </p>
        </article>
        <article className={ui.bentoCard}>
          <p className={ui.bentoLabel}>Nudge</p>
          <p style={{ fontSize: "0.85rem" }}>3 friends logged gratitude tonight.</p>
        </article>
        <article className={ui.bentoCard}>
          <p className={ui.bentoLabel}>Maghrib Circle</p>
          <p style={{ fontSize: "0.85rem" }}>Your circle meets in 2h (preview).</p>
        </article>
      </section>

      {!bootstrap?.isLoggedIn ? (
        <p className={styles.banner}>
          Sign in from Settings to sync goals. Slips stay on this device.
        </p>
      ) : null}

      <details style={{ marginTop: "1rem" }}>
        <summary className={styles.meta}>Today&apos;s intentions</summary>
        {intentions.map((item) => (
          <label
            className={styles.meta}
            key={item.id}
            style={{ display: "block", marginTop: "0.5rem" }}
          >
            <input
              checked={item.completedToday}
              onChange={() => handleToggleIntention(item.id)}
              style={{ marginRight: "0.5rem" }}
              type="checkbox"
            />
            {item.title}
          </label>
        ))}
      </details>

      <p className={styles.meta} style={{ marginTop: "1rem" }}>
        Today is {todayIso()}.
      </p>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className={styles.pageLead}>Loading…</p>}>
      <DashboardContent />
    </Suspense>
  );
}
