"use client";

import { usePathname } from "next/navigation";

import BottomCommandNav from "@/components/fbg/ui/BottomCommandNav";

import styles from "./fbg.module.css";

interface FbgShellProps {
  children: React.ReactNode;
  hideCommandBar?: boolean;
  commandBarProps?: React.ComponentProps<typeof BottomCommandNav>;
}

const hideNavForPath = (pathname: string): boolean =>
  pathname.startsWith("/recover/assign") || pathname.startsWith("/memorize/");

export default function FbgShell({
  children,
  hideCommandBar = false,
  commandBarProps,
}: FbgShellProps) {
  const pathname = usePathname();
  const hideNav = hideCommandBar || hideNavForPath(pathname);

  return (
    <div className={styles.shell}>
      <main className={styles.main}>{children}</main>
      {!hideNav ? <BottomCommandNav {...commandBarProps} /> : null}
    </div>
  );
}
