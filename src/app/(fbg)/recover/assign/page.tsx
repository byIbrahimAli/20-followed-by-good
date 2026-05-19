"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import AssignAyahFlipCard, {
  type AssignAyahFlipCardRef,
} from "@/components/fbg/AssignAyahFlipCard";
import styles from "@/components/fbg/fbg.module.css";
import ListenButton from "@/components/fbg/ListenButton";
import TafsirButton from "@/components/fbg/TafsirButton";
import TopAppBar from "@/components/fbg/ui/TopAppBar";
import ui from "@/components/fbg/ui/ui.module.css";
import {
  addSrsSession,
  getAssignment,
  loadAssignmentFromBackup,
  updateAssignment,
  upsertAssignment,
  type Assignment,
} from "@/lib/fbg/store";
import {
  fetchVerseFields,
  isLikelyIncompleteVerse,
  mergeHydratedVerse,
} from "@/lib/fbg/hydrate-assignment-verse";
import { scheduleNextDue } from "@/lib/fbg/srs";

async function fetchAssignmentFromApi(id: string): Promise<Assignment | null> {
  const response = await fetch(`/api/fbg/assign?id=${encodeURIComponent(id)}`, {
    credentials: "include",
  });
  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    assignment?: {
      assignmentId?: string;
      arabicText: string;
      ayahNumber: number;
      category: string;
      reflectionPrompt: string;
      surahName: string;
      tafsirSnippet: string;
      translationText: string;
      verseKey: string;
    };
  };

  if (!payload.assignment) {
    return null;
  }

  const a = payload.assignment;
  return {
    id: a.assignmentId ?? id,
    arabicText: a.arabicText,
    ayahNumber: a.ayahNumber,
    category: a.category,
    createdAt: new Date().toISOString(),
    reflectionPrompt: a.reflectionPrompt,
    status: "pending",
    surahName: a.surahName,
    tafsirSnippet: a.tafsirSnippet,
    translationText: a.translationText,
    verseKey: a.verseKey,
  };
}

function AssignContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get("id");

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const flipCardRef = useRef<AssignAyahFlipCardRef>(null);
  const [flipUi, setFlipUi] = useState({
    error: null as string | null,
    isFlipped: false,
    loading: false,
  });

  useEffect(() => {
    if (!assignmentId) {
      setLoading(false);
      return;
    }

    const hydrateVerse = async (current: Assignment): Promise<Assignment> => {
      const verse = await fetchVerseFields(current.verseKey);
      if (!verse) {
        return current;
      }

      if (
        !isLikelyIncompleteVerse(current.arabicText) &&
        verse.arabicText === current.arabicText
      ) {
        return current;
      }

      const merged = mergeHydratedVerse(current, verse);
      upsertAssignment(merged);
      return merged;
    };

    const load = async () => {
      let current =
        getAssignment(assignmentId) ?? loadAssignmentFromBackup(assignmentId);

      if (!current) {
        current = await fetchAssignmentFromApi(assignmentId);
      }

      if (current) {
        upsertAssignment(current);
        const hydrated = await hydrateVerse(current);
        setAssignment(hydrated);
      }

      setLoading(false);
    };

    void load();
  }, [assignmentId]);

  const handleMemorize = () => {
    if (!assignment) {
      return;
    }

    const scheduled = scheduleNextDue(0);
    const session = addSrsSession({
      arabicText: assignment.arabicText,
      assignmentId: assignment.id,
      nextDue: scheduled.nextDue,
      intervalIndex: scheduled.intervalIndex,
      surahName: assignment.surahName,
      translationText: assignment.translationText,
      verseKey: assignment.verseKey,
    });

    updateAssignment(assignment.id, { status: "memorizing" });
    router.push(`/memorize/${session.id}`);
  };

  const handleSaveLater = () => {
    if (!assignment) {
      return;
    }

    setSaving(true);

    const scheduled = scheduleNextDue(0);
    addSrsSession({
      arabicText: assignment.arabicText,
      assignmentId: assignment.id,
      nextDue: scheduled.nextDue,
      intervalIndex: scheduled.intervalIndex,
      surahName: assignment.surahName,
      translationText: assignment.translationText,
      verseKey: assignment.verseKey,
    });

    updateAssignment(assignment.id, { status: "memorizing" });
    router.push("/?saved=1");
  };

  if (!assignmentId) {
    return <p className={styles.pageLead}>No assignment selected.</p>;
  }

  if (loading) {
    return <p className={styles.pageLead}>Loading your ayah…</p>;
  }

  if (!assignment) {
    return (
      <p className={styles.pageLead}>
        Assignment not found.{" "}
        <button className={styles.secondaryButton} onClick={() => router.push("/")} type="button">
          Start from home
        </button>
      </p>
    );
  }

  const contextLabel = assignment.category.toLowerCase();

  return (
    <>
      <TopAppBar title="Ayah assignment" />

      <p className={ui.contextBanner}>For: {contextLabel}</p>

      <AssignAyahFlipCard
        assignment={assignment}
        onFlipStateChange={setFlipUi}
        ref={flipCardRef}
      />

      <div className={ui.actionStubRow}>
        <ListenButton verseKey={assignment.verseKey} />
        <TafsirButton
          error={flipUi.error}
          isFlipped={flipUi.isFlipped}
          loading={flipUi.loading}
          onToggle={() => {
            const card = flipCardRef.current;
            if (!card) {
              return;
            }
            if (card.isFlipped) {
              card.flipToFront();
            } else {
              card.flipToTafsir();
            }
          }}
        />
      </div>

      <button className={ui.primaryGradient} onClick={handleMemorize} type="button">
        Begin memorizing
      </button>
      <button
        className={styles.secondaryButton}
        disabled={saving}
        onClick={handleSaveLater}
        type="button"
      >
        {saving ? "Saving…" : "Save for later"}
      </button>
    </>
  );
}

export default function AssignPage() {
  return (
    <Suspense fallback={<p className={styles.pageLead}>Loading…</p>}>
      <AssignContent />
    </Suspense>
  );
}
