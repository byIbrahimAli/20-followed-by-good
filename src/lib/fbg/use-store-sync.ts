"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getStore,
  seedDemoIfNeeded,
  STORE_UPDATED_EVENT,
  type Assignment,
  type SrsSession,
} from "@/lib/fbg/store";

export const useStoreSync = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sessions, setSessions] = useState<SrsSession[]>([]);

  const refresh = useCallback(() => {
    seedDemoIfNeeded();
    const store = getStore();
    setAssignments(store.assignments);
    setSessions(store.srsSessions);
  }, []);

  useEffect(() => {
    refresh();

    const onFocus = () => refresh();
    const onStorage = () => refresh();
    const onStoreUpdated = () => refresh();

    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    window.addEventListener(STORE_UPDATED_EVENT, onStoreUpdated);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(STORE_UPDATED_EVENT, onStoreUpdated);
    };
  }, [refresh]);

  return { assignments, sessions, refresh };
};
