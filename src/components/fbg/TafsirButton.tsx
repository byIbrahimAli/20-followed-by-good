"use client";

import VerseActionButton from "@/components/fbg/VerseActionButton";

interface TafsirButtonProps {
  className?: string;
  error?: string | null;
  isFlipped?: boolean;
  loading?: boolean;
  onToggle: () => void;
}

export default function TafsirButton({
  className,
  error,
  isFlipped = false,
  loading = false,
  onToggle,
}: TafsirButtonProps) {
  const label = loading ? "Loading…" : isFlipped ? "Ayah" : "Tafsir";
  const icon = loading
    ? "hourglass_empty"
    : isFlipped
      ? "flip_to_front"
      : "menu_book";

  return (
    <VerseActionButton
      className={className}
      disabled={loading}
      icon={icon}
      label={label}
      onClick={onToggle}
      title={error ?? undefined}
    >
      {label}
    </VerseActionButton>
  );
}
