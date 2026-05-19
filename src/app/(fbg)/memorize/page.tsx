"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import styles from "@/components/fbg/fbg.module.css";
import TurningPointsPanel from "@/components/fbg/TurningPointsPanel";
import ReviewCard from "@/components/fbg/ui/ReviewCard";
import TopAppBar from "@/components/fbg/ui/TopAppBar";
import ui from "@/components/fbg/ui/ui.module.css";
import { buildMemorizedItems, buildReviewItems } from "@/lib/fbg/review-items";
import { buildTurningPointsSummary } from "@/lib/fbg/turning-points";
import { useStoreSync } from "@/lib/fbg/use-store-sync";

type QueueTab = "review" | "memorized";

export default function MemorizeHubPage() {
  const { assignments, sessions } = useStoreSync();
  const [queueTab, setQueueTab] = useState<QueueTab>("review");

  const inReviewItems = useMemo(
    () => buildReviewItems(assignments, sessions),
    [assignments, sessions],
  );
  const memorizedItems = useMemo(
    () => buildMemorizedItems(assignments, sessions),
    [assignments, sessions],
  );
  const turningPoints = useMemo(
    () => buildTurningPointsSummary(assignments, sessions),
    [assignments, sessions],
  );

  const activeItems = queueTab === "review" ? inReviewItems : memorizedItems;

  return (
    <>
      <TopAppBar title="Memorize" />

      <TurningPointsPanel summary={turningPoints} />

      <section aria-label="Your ayahs" className={ui.queueSection}>
        <div className={ui.segmentTabBar} role="tablist">
          <button
            aria-selected={queueTab === "review"}
            className={queueTab === "review" ? ui.segmentTabActive : ui.segmentTab}
            onClick={() => setQueueTab("review")}
            role="tab"
            type="button"
          >
            In review ({inReviewItems.length})
          </button>
          <button
            aria-selected={queueTab === "memorized"}
            className={queueTab === "memorized" ? ui.segmentTabActive : ui.segmentTab}
            onClick={() => setQueueTab("memorized")}
            role="tab"
            type="button"
          >
            Memorized ({memorizedItems.length})
          </button>
        </div>

        {activeItems.length === 0 ? (
          <p className={styles.meta} role="tabpanel">
            {queueTab === "review" ? (
              <>
                Nothing due right now. Log a slip on Home or use{" "}
                <Link href="/?demo=1">demo data</Link>.
              </>
            ) : (
              "Ayahs you mark with Got it will appear here."
            )}
          </p>
        ) : (
          <div className={ui.reviewList} role="tabpanel">
            {activeItems.map((item) => (
              <ReviewCard
                arabicSnippet={item.arabicSnippet}
                href={item.href}
                key={item.id}
                memorized={item.memorized}
                subtitle={item.subtitle}
                title={item.title}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
