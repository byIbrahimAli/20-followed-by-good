"use client";

import { gsap } from "gsap";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import styles from "@/components/fbg/fbg.module.css";
import ReflectSection from "@/components/fbg/ReflectSection";
import ui from "@/components/fbg/ui/ui.module.css";
import type { Assignment } from "@/lib/fbg/store";

export interface AssignAyahFlipCardRef {
  flipToFront: () => void;
  flipToTafsir: () => void;
  isFlipped: boolean;
  loading: boolean;
  error: string | null;
}

export interface FlipCardUiState {
  error: string | null;
  isFlipped: boolean;
  loading: boolean;
}

interface AssignAyahFlipCardProps {
  assignment: Assignment;
  onFlipStateChange?: (state: FlipCardUiState) => void;
}

const AssignAyahFlipCard = forwardRef<AssignAyahFlipCardRef, AssignAyahFlipCardProps>(
  function AssignAyahFlipCard({ assignment, onFlipStateChange }, ref) {
    const flipInnerRef = useRef<HTMLDivElement>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tafsirText, setTafsirText] = useState<string | null>(null);

    const animateFlip = useCallback((toBack: boolean, onDone?: () => void) => {
      const el = flipInnerRef.current;
      if (!el) {
        setIsFlipped(toBack);
        onDone?.();
        return;
      }

      gsap.to(el, {
        rotateY: toBack ? 180 : 0,
        duration: 0.65,
        ease: "power2.inOut",
        onComplete: () => {
          setIsFlipped(toBack);
          onDone?.();
        },
      });
    }, []);

    const fetchTafsir = useCallback(async (): Promise<boolean> => {
      if (tafsirText) {
        return true;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/fbg/tafsir?verseKey=${encodeURIComponent(assignment.verseKey)}`,
          { credentials: "include" },
        );

        let payload: { text?: string; error?: string; ok?: boolean } = {};
        try {
          payload = (await response.json()) as typeof payload;
        } catch {
          payload = {};
        }

        if (!response.ok || !payload.ok || !payload.text) {
          setError(payload.error ?? "Could not load tafsir.");
          return false;
        }

        setTafsirText(payload.text);
        return true;
      } catch {
        setError("Could not reach the tafsir service.");
        return false;
      } finally {
        setLoading(false);
      }
    }, [assignment.verseKey, tafsirText]);

    const flipToTafsir = useCallback(async () => {
      if (isFlipped) {
        return;
      }

      await fetchTafsir();
      animateFlip(true);
    }, [animateFlip, fetchTafsir, isFlipped]);

    const flipToFront = useCallback(() => {
      if (!isFlipped) {
        return;
      }
      animateFlip(false);
    }, [animateFlip, isFlipped]);

    useImperativeHandle(
      ref,
      () => ({
        flipToFront,
        flipToTafsir: () => {
          void flipToTafsir();
        },
        isFlipped,
        loading,
        error,
      }),
      [error, flipToFront, flipToTafsir, isFlipped, loading],
    );

    useEffect(() => {
      const el = flipInnerRef.current;
      if (!el) {
        return;
      }

      gsap.set(el, { rotateY: 0, transformStyle: "preserve-3d" });
    }, []);

    useEffect(() => {
      setTafsirText(null);
      setError(null);
      setIsFlipped(false);
      const el = flipInnerRef.current;
      if (el) {
        gsap.set(el, { rotateY: 0 });
      }
    }, [assignment.verseKey]);

    useEffect(() => {
      onFlipStateChange?.({ error, isFlipped, loading });
    }, [error, isFlipped, loading, onFlipStateChange]);

    return (
      <div className={styles.flipScene}>
        <div className={styles.flipInner} ref={flipInnerRef}>
          <section className={`${styles.flipFace} ${styles.flipFaceFront} ${ui.glassCard}`}>
            <div className={styles.flipScroll}>
              <p className={styles.meta}>
                {assignment.surahName} · {assignment.verseKey} · Ayah {assignment.ayahNumber}
              </p>
              <p className={styles.arabic}>{assignment.arabicText}</p>
              <p className={styles.translation}>{assignment.translationText}</p>
              <ReflectSection />
            </div>
          </section>

          <section className={`${styles.flipFace} ${styles.flipFaceBack} ${ui.glassCard}`}>
            <div className={styles.flipBackHeader}>
              <p className={ui.sectionLabel}>Tafsir</p>
              <button className={styles.flipBackBtn} onClick={flipToFront} type="button">
                <span className={`${ui.materialIcon} ${ui.verseActionIcon}`}>
                  flip_to_front
                </span>
                Ayah
              </button>
            </div>
            <div className={styles.flipScroll}>
              {loading ? <p className={styles.meta}>Loading tafsir…</p> : null}
              {error ? <p className={styles.banner}>{error}</p> : null}
              {tafsirText
                ? tafsirText.split("\n\n").map((paragraph, index) => (
                    <p className={styles.tafsirParagraph} key={index}>
                      {paragraph}
                    </p>
                  ))
                : null}
            </div>
          </section>
        </div>
      </div>
    );
  },
);

export default AssignAyahFlipCard;
