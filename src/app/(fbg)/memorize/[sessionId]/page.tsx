"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import BlurVerse from "@/components/fbg/blur-verse";
import ListenButton from "@/components/fbg/ListenButton";
import DiffFeedback from "@/components/fbg/diff-feedback";
import styles from "@/components/fbg/fbg.module.css";
import TopAppBar from "@/components/fbg/ui/TopAppBar";
import ui from "@/components/fbg/ui/ui.module.css";
import { gradeSession } from "@/lib/fbg/srs";
import { getSrsSession, updateSrsSession, type SrsSession } from "@/lib/fbg/store";

export default function MemorizePage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;

  const [session, setSession] = useState<SrsSession | null>(null);
  const [recallText, setRecallText] = useState("");
  const [revealAll, setRevealAll] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      return;
    }
    setSession(getSrsSession(sessionId));
  }, [sessionId]);

  const applyGrade = (grade: "easy" | "hard") => {
    if (!session) {
      return;
    }

    const graded = gradeSession(session.intervalIndex, grade);
    updateSrsSession(session.id, graded);
    router.push("/");
  };

  if (!session) {
    return <p className={styles.pageLead}>Session not found.</p>;
  }

  return (
    <>
      <TopAppBar title="SRS session" />

      <section className={ui.srsCard}>
        <p className={styles.meta}>
          {session.surahName} · {session.verseKey}
        </p>
        <BlurVerse revealAll={revealAll} text={session.arabicText} />
        <p className={styles.translation}>{session.translationText}</p>
      </section>

      <p className={styles.meta}>Type to recall (translation)</p>
      <textarea
        className={styles.textarea}
        onChange={(event) => setRecallText(event.target.value)}
        placeholder="Type what you remember…"
        value={recallText}
      />
      <DiffFeedback actual={recallText} expected={session.translationText} />

      <div className={styles.actionRow}>
        <ListenButton className={ui.stubBtn} verseKey={session.verseKey} />
        <button
          className={styles.secondaryButton}
          onClick={() => setRevealAll(true)}
          type="button"
        >
          Reveal all
        </button>
        <button
          className={styles.primaryButton}
          onClick={() => applyGrade("hard")}
          type="button"
        >
          Hard
        </button>
        <button
          className={styles.primaryButton}
          onClick={() => applyGrade("easy")}
          type="button"
        >
          Easy
        </button>
      </div>

      <div className={ui.srsInputBar}>
        <input
          className={ui.srsInput}
          disabled
          placeholder="Recite or type your recall…"
          type="text"
        />
      </div>
    </>
  );
}
