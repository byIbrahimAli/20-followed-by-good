"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import styles from "@/components/fbg/fbg.module.css";

function RecoverRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q");

  useEffect(() => {
    if (q) {
      router.replace(`/?q=${encodeURIComponent(q)}#moment`);
    } else {
      router.replace("/#moment");
    }
  }, [q, router]);

  return <p className={styles.pageLead}>Opening home…</p>;
}

export default function RecoverPage() {
  return (
    <Suspense fallback={<p className={styles.pageLead}>Loading…</p>}>
      <RecoverRedirect />
    </Suspense>
  );
}
