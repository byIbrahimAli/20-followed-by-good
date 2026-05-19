"use client";

import { useCallback, useState } from "react";

import TafsirSheet from "@/components/fbg/TafsirSheet";
import VerseActionButton from "@/components/fbg/VerseActionButton";

type TafsirState = "idle" | "loading" | "open" | "error";

interface TafsirButtonProps {
  className?: string;
  verseKey: string;
}

export default function TafsirButton({ className, verseKey }: TafsirButtonProps) {
  const [state, setState] = useState<TafsirState>("idle");
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const closeSheet = useCallback(() => {
    setState("idle");
    setError(null);
  }, []);

  const openTafsir = async () => {
    setState("loading");
    setError(null);
    setText(null);

    try {
      const response = await fetch(
        `/api/fbg/tafsir?verseKey=${encodeURIComponent(verseKey)}`,
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
        setState("error");
        return;
      }

      setText(payload.text);
      setState("open");
    } catch {
      setError("Could not reach the tafsir service.");
      setState("error");
    }
  };

  const handleClick = () => {
    if (state === "open" || state === "error") {
      if (state === "open") {
        closeSheet();
        return;
      }
      void openTafsir();
      return;
    }

    if (state === "loading") {
      return;
    }

    void openTafsir();
  };

  const label =
    state === "loading" ? "Loading…" : state === "error" ? "Retry" : "Tafsir";

  const icon = state === "loading" ? "hourglass_empty" : "menu_book";

  const sheetOpen = state === "open" || state === "loading" || state === "error";

  return (
    <>
      <VerseActionButton
        className={className}
        disabled={state === "loading"}
        icon={icon}
        label={label}
        onClick={handleClick}
        title={state === "error" ? (error ?? undefined) : undefined}
      >
        {label}
      </VerseActionButton>
      {sheetOpen ? (
        <TafsirSheet
          error={state === "error" ? error : null}
          loading={state === "loading"}
          onClose={closeSheet}
          text={text}
        />
      ) : null}
    </>
  );
}
