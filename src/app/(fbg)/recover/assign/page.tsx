"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import styles from "@/components/fbg/fbg.module.css";
import ListenButton from "@/components/fbg/ListenButton";
import GlassCard from "@/components/fbg/ui/GlassCard";
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
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!assignmentId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      const fromStore = getAssignment(assignmentId);
      if (fromStore) {
        setAssignment(fromStore);
        setLoading(false);
        return;
      }

      const fromBackup = loadAssignmentFromBackup(assignmentId);
      if (fromBackup) {
        upsertAssignment(fromBackup);
        setAssignment(fromBackup);
        setLoading(false);
        return;
      }

      const fromApi = await fetchAssignmentFromApi(assignmentId);
      if (fromApi) {
        upsertAssignment(fromApi);
        setAssignment(fromApi);
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

  const handleSaveLater = async () => {
    if (!assignment) {
      return;
    }

    setSaving(true);
    setMessage(null);
    updateAssignment(assignment.id, { status: "pending" });

    try {
      const response = await fetch("/api/collections", {
        body: JSON.stringify({ name: `Recovery · ${assignment.verseKey}` }),
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const payload = (await response.json()) as { message?: string; ok?: boolean };
      if (payload.ok) {
        setMessage("Saved locally and synced to your collections.");
      } else {
        setMessage("Saved on this device. Sign in to sync collections.");
      }
    } catch {
      setMessage("Saved on this device.");
    } finally {
      setSaving(false);
    }
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

      <GlassCard>
        <p className={styles.meta}>
          {assignment.surahName} · {assignment.verseKey} · Ayah {assignment.ayahNumber}
        </p>
        <p className={styles.arabic}>{assignment.arabicText}</p>
        <p className={styles.translation}>{assignment.translationText}</p>
        <p className={styles.tafsir}>{assignment.tafsirSnippet}</p>
        <p className={styles.meta}>
          <strong>Reflect:</strong> {assignment.reflectionPrompt}
        </p>
      </GlassCard>

      <div className={ui.actionStubRow}>
        <ListenButton verseKey={assignment.verseKey} />
        <button className={ui.stubBtn} type="button">
          <span className={ui.materialIcon}>menu_book</span> Tafsir
        </button>
      </div>

      {message ? <p className={styles.banner}>{message}</p> : null}

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
