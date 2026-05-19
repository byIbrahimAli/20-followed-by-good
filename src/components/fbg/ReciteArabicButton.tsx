"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import styles from "@/components/fbg/fbg.module.css";
import VerseActionButton from "@/components/fbg/VerseActionButton";

type ReciteState = "idle" | "listening" | "error";

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const getSpeechRecognition = (): SpeechRecognitionConstructor | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const win = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
};

interface ReciteArabicButtonProps {
  className?: string;
  onTranscript: (text: string) => void;
}

export default function ReciteArabicButton({
  className,
  onTranscript,
}: ReciteArabicButtonProps) {
  const [state, setState] = useState<ReciteState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const transcriptPartsRef = useRef<string[]>([]);

  const supported = getSpeechRecognition() !== null;

  const stopRecognition = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const startListening = () => {
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) {
      setState("error");
      setErrorMessage("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "ar-SA";
    recognition.continuous = true;
    recognition.interimResults = true;
    transcriptPartsRef.current = [];

    recognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (!result?.isFinal) {
          continue;
        }
        const piece = result[0]?.transcript?.trim();
        if (piece) {
          transcriptPartsRef.current.push(piece);
        }
      }
    };

    recognition.onerror = () => {
      setState("error");
      setErrorMessage("Could not capture recitation. Try again.");
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      const transcript = transcriptPartsRef.current.join(" ").trim();
      if (transcript) {
        onTranscript(transcript);
      }
      setState("idle");
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setState("listening");
      setErrorMessage(null);
    } catch {
      setState("error");
      setErrorMessage("Microphone access was blocked or unavailable.");
    }
  };

  const handleClick = () => {
    if (state === "listening") {
      stopRecognition();
      return;
    }

    startListening();
  };

  if (!supported) {
    return (
      <p className={styles.meta}>
        Recite works best in Chrome on desktop or Android. Speech recognition is not
        available here.
      </p>
    );
  }

  const label =
    state === "listening"
      ? "Stop reciting"
      : state === "error"
        ? "Retry"
        : "Recite Arabic";

  const icon =
    state === "listening" ? "stop_circle" : state === "error" ? "mic_off" : "mic";

  return (
    <VerseActionButton
      className={className}
      icon={icon}
      label={label}
      onClick={handleClick}
      title={errorMessage ?? "Browser speech recognition (ar-SA)"}
    >
      {label}
    </VerseActionButton>
  );
}
