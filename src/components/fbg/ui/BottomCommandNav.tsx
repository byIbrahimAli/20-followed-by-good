"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import ui from "./ui.module.css";

interface BottomCommandNavProps {
  placeholder?: string;
  onSubmit?: (text: string) => void;
}

const NAV = [
  { href: "/", icon: "home", match: (p: string) => p === "/" },
  {
    href: "/recover",
    icon: "auto_stories",
    match: (p: string) => p.startsWith("/recover") || p.startsWith("/memorize"),
  },
  { href: "/community", icon: "group", match: (p: string) => p.startsWith("/community") },
] as const;

export default function BottomCommandNav({
  placeholder = "What’s on your heart? (e.g. ‘Review Anger’)",
  onSubmit,
}: BottomCommandNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [text, setText] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    if (onSubmit) {
      onSubmit(trimmed);
      setText("");
      return;
    }

    const params = new URLSearchParams({ q: trimmed });
    router.push(`/recover?${params.toString()}`);
  };

  return (
    <nav aria-label="Command" className={ui.bottomNav}>
      <form className={ui.bottomNavInner} onSubmit={handleSubmit}>
        <input
          aria-label="Command"
          className={ui.bottomInput}
          onChange={(event) => setText(event.target.value)}
          placeholder={placeholder}
          type="text"
          value={text}
        />
        <button aria-label="Voice (soon)" className={ui.micBtn} type="button">
          <span className={ui.materialIcon}>mic</span>
        </button>
        <button aria-label="Submit" className={ui.submitBtn} type="submit">
          <span className={ui.materialIcon}>arrow_forward</span>
        </button>
        <div className={ui.navIcons}>
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={active ? ui.navIconActive : ui.navIcon}
                href={item.href}
                key={item.href}
                title={item.icon}
              >
                <span className={ui.materialIcon}>{item.icon}</span>
              </Link>
            );
          })}
        </div>
      </form>
    </nav>
  );
}
