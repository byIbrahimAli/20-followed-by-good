"use client";

import ProfileMenu from "@/components/fbg/ProfileMenu";
import ui from "./ui.module.css";

interface TopAppBarProps {
  title: string;
  avatarLabel?: string;
}

export default function TopAppBar({
  title,
  avatarLabel = "Change theme",
}: TopAppBarProps) {
  return (
    <header className={ui.topBar}>
      <span className={ui.topBarSpacer} aria-hidden />
      <h1 className={ui.topBarTitle}>{title}</h1>
      <ProfileMenu label={avatarLabel} />
    </header>
  );
}
