"use client";

import Link from "next/link";
import { useMemo } from "react";

import styles from "@/components/fbg/fbg.module.css";
import ReviewCard from "@/components/fbg/ui/ReviewCard";
import TopAppBar from "@/components/fbg/ui/TopAppBar";
import ui from "@/components/fbg/ui/ui.module.css";
import {
  buildReviewItems,
  computeReviewMetrics,
} from "@/lib/fbg/review-items";
import { useStoreSync } from "@/lib/fbg/use-store-sync";

export default function MemorizeHubPage() {
  const { assignments, sessions } = useStoreSync();

  const reviewItems = useMemo(
    () => buildReviewItems(assignments, sessions),
    [assignments, sessions],
  );
  const metrics = useMemo(
    () => computeReviewMetrics(reviewItems),
    [reviewItems],
  );

  return (
    <>
      <TopAppBar title="Memorize" />

      <section className={ui.metricsRow}>
        <article className={ui.metricCard}>
          <p className={ui.metricValue}>{metrics.totalInReview}</p>
          <p className={ui.metricLabel}>In review</p>
        </article>
        <article className={ui.metricCard}>
          <p className={ui.metricValue}>{metrics.avgProgress}%</p>
          <p className={ui.metricLabel}>Avg progress</p>
        </article>
        <article className={ui.metricCard}>
          {metrics.closest ? (
            <>
              <p className={ui.metricValue}>{metrics.closest.percent}%</p>
              <p className={ui.metricLabel}>Closest</p>
            </>
          ) : (
            <>
              <p className={ui.metricValue}>—</p>
              <p className={ui.metricLabel}>Closest</p>
            </>
          )}
        </article>
      </section>

      {metrics.closest ? (
        <p className={styles.meta}>
          Next up:{" "}
          <Link href={metrics.closest.href}>
            {metrics.closest.title} · {metrics.closest.subtitle}
          </Link>
        </p>
      ) : null}

      <p className={ui.sectionLabel}>In review</p>
      {reviewItems.length === 0 ? (
        <p className={styles.meta}>
          Nothing due yet. Log a slip on Home or use{" "}
          <Link href="/?demo=1">demo data</Link>.
        </p>
      ) : (
        <div className={ui.reviewList}>
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
    </>
  );
}
