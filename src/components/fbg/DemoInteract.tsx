"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { pulseDemoBanner } from "@/lib/fbg/demo-banner-pulse";

interface DemoInteractProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

/** Non-functional control that flashes the DEMO ticker on tap (demo feedback). */
export default function DemoInteract({
  children,
  className,
  onClick,
  type = "button",
  ...props
}: DemoInteractProps) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    pulseDemoBanner();
    onClick?.(event);
  };

  return (
    <button className={className} onClick={handleClick} type={type} {...props}>
      {children}
    </button>
  );
}

interface DemoInteractRowProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export function DemoInteractRow({
  children,
  className,
  onClick,
  type = "button",
  ...props
}: DemoInteractRowProps) {
  return (
    <DemoInteract className={className} onClick={onClick} type={type} {...props}>
      {children}
    </DemoInteract>
  );
}
