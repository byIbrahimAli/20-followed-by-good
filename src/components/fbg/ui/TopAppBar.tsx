import Link from "next/link";

import ui from "./ui.module.css";

interface TopAppBarProps {
  title: string;
  avatarHref?: string;
  avatarLabel?: string;
}

export default function TopAppBar({
  title,
  avatarHref = "/settings",
  avatarLabel = "You",
}: TopAppBarProps) {
  return (
    <header className={ui.topBar}>
      <span className={ui.topBarSpacer} aria-hidden />
      <h1 className={ui.topBarTitle}>{title}</h1>
      <Link aria-label={avatarLabel} className={ui.avatar} href={avatarHref}>
        <span className={ui.materialIcon}>person</span>
      </Link>
    </header>
  );
}
