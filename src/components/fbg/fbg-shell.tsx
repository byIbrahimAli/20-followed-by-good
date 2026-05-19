"use client";

import BottomTabNav from "@/components/fbg/ui/BottomTabNav";

import styles from "./fbg.module.css";

interface FbgShellProps {
  children: React.ReactNode;
}

export default function FbgShell({ children }: FbgShellProps) {
  return (
    <div className={styles.shell}>
      <main className={styles.main}>{children}</main>
      <BottomTabNav />
    </div>
  );
}
