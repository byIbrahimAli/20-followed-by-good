"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import BlurRevealText from "@/components/fbg/BlurRevealText";
import BlurVerse from "@/components/fbg/blur-verse";
import DiffFeedback from "@/components/fbg/diff-feedback";
import styles from "@/components/fbg/fbg.module.css";
import ListenButton from "@/components/fbg/ListenButton";
import TopAppBar from "@/components/fbg/ui/TopAppBar";
import ui from "@/components/fbg/ui/ui.module.css";
import { getSrsSession, type SrsSession } from "@/lib/fbg/store";

export default function MemorizePage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;

  const [session, setSession] = useState<SrsSession | null>(null);
  const [recallText, setRecallText] = useState("");
  const [arabicRevealed, setArabicRevealed] = useState(false);
  const [translationRevealed, setTranslationRevealed] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      return;
    }
    setSession(getSrsSession(sessionId));
  }, [sessionId]);

  if (!session) {
    return <p className={styles.pageLead}>Session not found.</p>;
  }

  return (
    <>
      <TopAppBar title="Memorize" />

      <section className={ui.srsCard}>
        <p className={styles.meta}>
          {session.surahName} · {session.verseKey}
        </p>
        <BlurVerse revealedAll={arabicRevealed} text={session.arabicText} />
        <BlurRevealText
          className={styles.translation}
          dir="ltr"
          revealedAll={translationRevealed}
          text={session.translationText}
        />
      </section>

      <div className={ui.actionStubRow}>
        <button
          className={ui.verseActionBtn}
          onClick={() => setArabicRevealed((value) => !value)}
          type="button"
        >
          <span className={`${ui.materialIcon} ${ui.verseActionIcon}`}>
            {arabicRevealed ? "visibility_off" : "visibility"}
          </span>
          {arabicRevealed ? "Hide Arabic" : "Reveal Arabic"}
        </button>
        <button
          className={ui.verseActionBtn}
          onClick={() => setTranslationRevealed((value) => !value)}
          type="button"
        >
          <span className={`${ui.materialIcon} ${ui.verseActionIcon}`}>
            {translationRevealed ? "visibility_off" : "visibility"}
          </span>
          {translationRevealed ? "Hide translation" : "Reveal translation"}
        </button>
      </div>

      <div className={ui.actionStubRow}>
        <ListenButton verseKey={session.verseKey} />
      </div>

      <p className={ui.sectionLabel}>Type to recall (translation)</p>
      <textarea
        className={styles.textarea}
        onChange={(event) => setRecallText(event.target.value)}
        placeholder="Type what you remember of the meaning…"
        value={recallText}
      />
      <DiffFeedback actual={recallText} expected={session.translationText} />
    </>
  );
}
