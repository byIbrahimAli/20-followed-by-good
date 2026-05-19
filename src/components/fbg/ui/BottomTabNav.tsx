"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import ui from "./ui.module.css";

const TABS = [
  {
    href: "/",
    icon: "home",
    label: "Home",
    match: (pathname: string) => pathname === "/",
  },
  {
    href: "/memorize",
    icon: "auto_stories",
    label: "Memorize",
    match: (pathname: string) =>
      pathname === "/memorize" || pathname.startsWith("/memorize/"),
  },
  {
    href: "/community",
    icon: "group",
    label: "Community",
    match: (pathname: string) => pathname.startsWith("/community"),
  },
] as const;

export default function BottomTabNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className={ui.bottomNav}>
      <div className={ui.tabBar}>
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={active ? ui.tabItemActive : ui.tabItem}
              href={tab.href}
              key={tab.href}
            >
              <span className={ui.materialIcon}>{tab.icon}</span>
              <span className={ui.tabLabel}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
