"use client";

import type { ReactNode } from "react";

import ui from "@/components/fbg/ui/ui.module.css";

interface VerseActionButtonProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  icon: string;
  label: string;
  onClick: () => void;
  title?: string;
}

export default function VerseActionButton({
  children,
  className,
  disabled,
  icon,
  label,
  onClick,
  title,
}: VerseActionButtonProps) {
  return (
    <button
      aria-label={label}
      className={className ?? ui.verseActionBtn}
      disabled={disabled}
      onClick={onClick}
      title={title}
      type="button"
    >
      <span aria-hidden className={ui.verseActionIcon}>
        {icon}
      </span>
      <span className={ui.verseActionLabel}>{children ?? label}</span>
    </button>
  );
}
