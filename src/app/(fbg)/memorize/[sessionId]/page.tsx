"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import BlurRevealText from "@/components/fbg/BlurRevealText";
import BlurVerse from "@/components/fbg/blur-verse";
import DiffFeedback from "@/components/fbg/diff-feedback";
import styles from "@/components/fbg/fbg.module.css";
import ListenButton from "@/components/fbg/ListenButton";
import ReciteArabicButton from "@/components/fbg/ReciteArabicButton";
import TopAppBar from "@/components/fbg/ui/TopAppBar";
import ui from "@/components/fbg/ui/ui.module.css";
import { normalizeArabic } from "@/lib/fbg/normalize-arabic";
import { isSessionMastered } from "@/lib/fbg/srs";
import {
  getSrsSession,
  markSrsSessionMastered,
  restoreSrsSessionSnapshot,
  snapshotSrsSession,
  type SrsSession,
  type SrsSessionSnapshot,
} from "@/lib/fbg/store";

type RecallTab = "recite" | "type";

const UNDO_MS = 5000;

export default function MemorizePage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;

  const [session, setSession] = useState<SrsSession | null>(null);
  const [recallTab, setRecallTab] = useState<RecallTab>("recite");
  const [recallText, setRecallText] = useState("");
  const [recitedArabic, setRecitedArabic] = useState("");
  const [arabicRevealed, setArabicRevealed] = useState(false);
  const [translationRevealed, setTranslationRevealed] = useState(false);
  const [undoSnapshot, setUndoSnapshot] = useState<SrsSessionSnapshot | null>(null);
  const [undoSecondsLeft, setUndoSecondsLeft] = useState(0);

  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoTickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearUndoTimers = useCallback(() => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    if (undoTickRef.current) {
      clearInterval(undoTickRef.current);
      undoTickRef.current = null;
    }
  }, []);

  const refreshSession = useCallback(() => {
    if (!sessionId) {
      return;
    }
    setSession(getSrsSession(sessionId));
  }, [sessionId]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    return () => clearUndoTimers();
  }, [clearUndoTimers]);

  const handleGotIt = () => {
    if (!session || undoSnapshot) {
      return;
    }

    const snapshot = snapshotSrsSession(session);
    const updated = markSrsSessionMastered(session);
    if (!updated) {
      return;
    }

    setSession(updated);
    setUndoSnapshot(snapshot);
    setUndoSecondsLeft(Math.ceil(UNDO_MS / 1000));

    undoTickRef.current = setInterval(() => {
      setUndoSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);

    undoTimerRef.current = setTimeout(() => {
      clearUndoTimers();
      setUndoSnapshot(null);
      setUndoSecondsLeft(0);
    }, UNDO_MS);
  };

  const handleUndo = () => {
    if (!session || !undoSnapshot) {
      return;
    }

    clearUndoTimers();
    const restored = restoreSrsSessionSnapshot(
      session.id,
      undoSnapshot,
      session.assignmentId,
    );
    setUndoSnapshot(null);
    setUndoSecondsLeft(0);
    if (restored) {
      setSession(restored);
    } else {
      refreshSession();
    }
  };

  if (!session) {
    return <p className={styles.pageLead}>Session not found.</p>;
  }

  const isMastered = isSessionMastered(session.intervalIndex);

  return (
    <>
      <TopAppBar title="Memorize" />

      <div className={ui.memorizeLayout}>
        <div className={ui.memorizeCardBlock}>
          <section className={ui.srsCard}>
            <p className={styles.meta}>
              {session.surahName} · {session.verseKey}
            </p>
            <p className={styles.meta}>Tap a word to reveal it.</p>
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

        </div>

        <section aria-label="Recall practice" className={ui.memorizeRecallBlock}>
          <div className={ui.segmentTabBar} role="tablist">
            <button
              aria-selected={recallTab === "recite"}
              className={recallTab === "recite" ? ui.segmentTabActive : ui.segmentTab}
              onClick={() => setRecallTab("recite")}
              role="tab"
              type="button"
            >
              Recite (Arabic)
            </button>
            <button
              aria-selected={recallTab === "type"}
              className={recallTab === "type" ? ui.segmentTabActive : ui.segmentTab}
              onClick={() => setRecallTab("type")}
              role="tab"
              type="button"
            >
              Type (translation)
            </button>
          </div>

          {recallTab === "recite" ? (
            <div role="tabpanel">
              <p className={styles.meta}>
                Tap Recite Arabic, recite the ayah, then tap Stop. Works best in Chrome
                with a quiet room.
              </p>
              <ReciteArabicButton onTranscript={setRecitedArabic} />
              <DiffFeedback
                actual={recitedArabic}
                dir="rtl"
                emptyHint="Your recitation will appear here after you stop recording."
                expected={session.arabicText}
                normalize={normalizeArabic}
                remainingLabel="ayah"
                scoreLabel="words"
              />
            </div>
          ) : (
            <div role="tabpanel">
              <textarea
                className={styles.textarea}
                onChange={(event) => setRecallText(event.target.value)}
                placeholder="Type what you remember of the meaning…"
                value={recallText}
              />
              <DiffFeedback
                actual={recallText}
                expected={session.translationText}
                remainingLabel="translation"
              />
            </div>
          )}
        </section>
      </div>

      <div className={ui.memorizePageFooter}>
        {undoSnapshot ? (
          <div className={ui.undoBar} role="status">
            <span>
              Marked as memorized
              {undoSecondsLeft > 0 ? ` · ${undoSecondsLeft}s` : ""}
            </span>
            <button className={ui.undoBtn} onClick={handleUndo} type="button">
              Undo
            </button>
          </div>
        ) : null}

        <button
          className={styles.primaryButton}
          disabled={isMastered || Boolean(undoSnapshot)}
          onClick={handleGotIt}
          type="button"
        >
          {isMastered ? "Memorized" : "Got it"}
        </button>

        {isMastered && !undoSnapshot ? (
          <button
            className={styles.secondaryButton}
            onClick={() => router.push("/memorize")}
            type="button"
          >
            Back to Memorize hub
          </button>
        ) : null}
      </div>
    </>
  );
}
