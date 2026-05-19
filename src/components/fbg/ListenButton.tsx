"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import ui from "@/components/fbg/ui/ui.module.css";

type ListenState = "idle" | "loading" | "playing" | "paused" | "error";

interface ListenButtonProps {
  className?: string;
  verseKey: string;
}

export default function ListenButton({ className, verseKey }: ListenButtonProps) {
  const [state, setState] = useState<ListenState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const stopPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
  }, []);

  useEffect(() => {
    stopPlayback();
    audioRef.current = null;
    audioUrlRef.current = null;
    setState("idle");
    setErrorMessage(null);
  }, [stopPlayback, verseKey]);

  useEffect(() => {
    return () => {
      stopPlayback();
      audioRef.current = null;
      audioUrlRef.current = null;
    };
  }, [stopPlayback]);

  const ensureAudio = async (): Promise<HTMLAudioElement | null> => {
    if (audioRef.current && audioUrlRef.current) {
      return audioRef.current;
    }

    setState("loading");
    setErrorMessage(null);

    try {
      const response = await fetch(
        `/api/fbg/audio?verseKey=${encodeURIComponent(verseKey)}`,
        { credentials: "include" },
      );

      let payload: { audioUrl?: string; error?: string; ok?: boolean } = {};
      try {
        payload = (await response.json()) as typeof payload;
      } catch {
        payload = {};
      }

      if (!response.ok || !payload.ok || !payload.audioUrl) {
        const message = payload.error ?? "Could not load audio.";
        setErrorMessage(message);
        setState("error");
        return null;
      }

      const audio = new Audio(payload.audioUrl);
      audioRef.current = audio;
      audioUrlRef.current = payload.audioUrl;

      audio.addEventListener("ended", () => {
        setState("idle");
      });

      audio.addEventListener("pause", () => {
        setState((current) => (current === "playing" ? "paused" : current));
      });

      audio.addEventListener("play", () => {
        setState("playing");
      });

      return audio;
    } catch {
      setErrorMessage("Could not reach the audio service.");
      setState("error");
      return null;
    }
  };

  const handleClick = async () => {
    if (state === "loading") {
      return;
    }

    if (state === "playing") {
      audioRef.current?.pause();
      setState("paused");
      return;
    }

    if (state === "paused") {
      try {
        await audioRef.current?.play();
        setState("playing");
      } catch {
        setErrorMessage("Playback was blocked.");
        setState("error");
      }
      return;
    }

    if (state === "error") {
      audioRef.current = null;
      audioUrlRef.current = null;
    }

    try {
      const audio = await ensureAudio();
      if (!audio) {
        return;
      }

      await audio.play();
      setState("playing");
    } catch {
      setErrorMessage("Playback was blocked.");
      setState("error");
    }
  };

  const label =
    state === "loading"
      ? "Loading…"
      : state === "playing"
        ? "Pause"
        : state === "paused"
          ? "Resume"
          : state === "error"
            ? "Retry"
            : "Listen";

  const icon =
    state === "loading"
      ? "hourglass_empty"
      : state === "playing"
        ? "pause"
        : "headphones";

  return (
    <button
      aria-label={label}
      className={className ?? ui.stubBtn}
      disabled={state === "loading"}
      onClick={() => void handleClick()}
      title={errorMessage ?? undefined}
      type="button"
    >
      <span className={ui.materialIcon}>{icon}</span> {label}
    </button>
  );
}
