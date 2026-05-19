import Link from "next/link";

import ui from "./ui.module.css";

interface TopAppBarProps {
  title: string;
  showMenu?: boolean;
  avatarHref?: string;
  avatarLabel?: string;
}

export default function TopAppBar({
  title,
  showMenu = true,
  avatarHref = "/settings",
  avatarLabel = "You",
}: TopAppBarProps) {
  return (
    <header className={ui.topBar}>
      {showMenu ? (
        <button aria-label="Menu" className={ui.iconButton} type="button">
          <span className={ui.materialIcon}>menu</span>
        </button>
      ) : (
        <span style={{ width: "2.5rem" }} />
      )}
      <h1 className={ui.topBarTitle}>{title}</h1>
      <Link aria-label={avatarLabel} className={ui.avatar} href={avatarHref}>
        <span className={ui.materialIcon}>person</span>
      </Link>
    </header>
  );
}
