"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import useSWR from "swr";

import styles from "@/components/fbg/fbg.module.css";
import Chip from "@/components/fbg/ui/Chip";
import GlassCard from "@/components/fbg/ui/GlassCard";
import TopAppBar from "@/components/fbg/ui/TopAppBar";
import ui from "@/components/fbg/ui/ui.module.css";
import { continueToAyah } from "@/lib/fbg/recovery-actions";
import { getTaxonomyChips } from "@/lib/fbg/slip-taxonomy";
import { getRecentCategories } from "@/lib/fbg/store";
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
  const { data: bootstrap } = useSWR("fbg-bootstrap", fetchBootstrap);

  const chips = getTaxonomyChips(getRecentCategories());

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setText(q);
    }
  }, [searchParams]);

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

      {!bootstrap?.isLoggedIn ? (
        <p className={styles.banner}>
          Sign in from Settings to sync collections. Slips stay on this device.
        </p>
      ) : null}
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
