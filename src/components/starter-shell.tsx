"use client";

import Link from "next/link";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import useSWR from "swr";

import { starterConfig } from "../../starter.config";
import type { BootstrapPayload, BookmarkItem, CollectionItem, NoteItem, ReaderPayload } from "@/lib/types";

import styles from "./starter-shell.module.css";

export type StarterRoute =
  | "home"
  | "search"
  | "reader"
  | "library"
  | "goals"
  | "reflect"
  | "settings";

type ToastType = "error" | "success";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface SearchPayload {
  error: string | null;
  navigationItems: Array<{
    label?: string;
    readerUrl: string | null;
    subtitle?: string | null;
  }>;
  query: string;
  verseItems: Array<{
    readerUrl: string | null;
    text?: string;
    verseKey?: string | null;
  }>;
}

interface MutationResult<T = unknown> {
  data?: T;
  deletedId?: string;
  gatingMessage?: string | null;
  item?: T;
  message?: string;
  ok?: boolean;
  signedOut?: boolean;
}

interface StarterShellProps {
  route: StarterRoute;
  chapterId?: string;
}

const navigationItems: Array<{ href: string; key: StarterRoute; label: string }> = [
  { href: "/", key: "home", label: "Home" },
  { href: "/read/1", key: "reader", label: "Reader" },
  { href: "/search", key: "search", label: "Search" },
  { href: "/library", key: "library", label: "Library" },
  { href: "/goals", key: "goals", label: "Goals" },
  { href: "/reflect", key: "reflect", label: "Reflect" },
  { href: "/settings", key: "settings", label: "Settings" },
];

const fetchJson = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url, { credentials: "include" });
  const payload = (await response.json().catch(() => ({}))) as T;

  if (!response.ok) {
    throw payload;
  }

  return payload;
};

const mutationRequest = async <T,>(
  url: string,
  method: "DELETE" | "POST",
  body?: Record<string, unknown>,
): Promise<MutationResult<T>> => {
  const response = await fetch(url, {
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
    method,
  });

  const payload = (await response.json().catch(() => ({}))) as MutationResult<T>;

  if (!response.ok) {
    throw payload;
  }

  return payload;
};

const focusAllows = (route: StarterRoute, section: "auth" | "content" | "goals" | "library" | "reader" | "reflect" | "search") => {
  if (route === "home") {
    return true;
  }

  const mapping: Record<StarterRoute, string[]> = {
    goals: ["goals", "auth"],
    home: ["auth", "content", "goals", "library", "reader", "reflect", "search"],
    library: ["library", "auth"],
    reader: ["reader", "content", "auth"],
    reflect: ["reflect", "auth"],
    search: ["search", "content", "auth"],
    settings: ["auth", "goals"],
  };

  return mapping[route].includes(section);
};

const tryParseJsonObject = (value: string): Record<string, unknown> | null => {
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch (_error) {
    return null;
  }
};

const createToastId = (): number => Date.now() + Math.floor(Math.random() * 1000);

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) {
      return message;
    }
  }

  return fallback;
};

export default function StarterShell({ chapterId = "1", route }: StarterShellProps) {
  const {
    data,
    error: bootstrapError,
    isLoading,
    mutate,
  } = useSWR<BootstrapPayload>("/api/bootstrap", fetchJson, {
    revalidateOnFocus: false,
  });

  const [activeToasts, setActiveToasts] = useState<Toast[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [readerChapter, setReaderChapter] = useState(chapterId);
  const [noteVerseKey, setNoteVerseKey] = useState("1:1");
  const [noteBody, setNoteBody] = useState("");
  const [bookmarkChapter, setBookmarkChapter] = useState("1");
  const [bookmarkVerse, setBookmarkVerse] = useState("1");
  const [collectionName, setCollectionName] = useState("");
  const [reflectionVerseKey, setReflectionVerseKey] = useState("1:1");
  const [reflectionBody, setReflectionBody] = useState("");
  const [goalPayloadText, setGoalPayloadText] = useState(
    JSON.stringify(
      {
        category: "QURAN",
        period: "daily",
        targetAmount: 2,
        type: "PAGES",
      },
      null,
      2,
    ),
  );
  const [preferencesPayloadText, setPreferencesPayloadText] = useState(
    JSON.stringify(
      {
        fontSize: 3,
        mushafLines: 15,
        reciter: 7,
      },
      null,
      2,
    ),
  );

  const deferredSearch = useDeferredValue(searchInput);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(deferredSearch.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [deferredSearch]);

  useEffect(() => {
    setReaderChapter(chapterId);
  }, [chapterId]);

  useEffect(() => {
    if (route !== "home" && route !== "search") {
      return;
    }

    const current = new URL(window.location.href);
    const next = debouncedQuery.trim();

    if (next) {
      current.searchParams.set("search", next);
    } else {
      current.searchParams.delete("search");
    }

    window.history.replaceState({}, "", `${current.pathname}${current.search}`);
  }, [debouncedQuery, route]);

  useEffect(() => {
    if (!data?.flashNotice?.message) {
      return;
    }

    pushToast(data.flashNotice.message, data.flashNotice.type);
  }, [data?.flashNotice?.message, data?.flashNotice?.type]);

  useEffect(() => {
    if (!data?.authError) {
      return;
    }

    pushToast(data.authError, "error");
  }, [data?.authError]);

  const readerPath = useMemo(
    () => `/api/reader/${encodeURIComponent(readerChapter || chapterId || "1")}`,
    [chapterId, readerChapter],
  );

  const {
    data: searchData,
    isLoading: isSearchLoading,
    mutate: mutateSearch,
  } = useSWR<SearchPayload>(
    debouncedQuery ? `/api/search?query=${encodeURIComponent(debouncedQuery)}` : null,
    fetchJson,
    { keepPreviousData: true, revalidateOnFocus: false },
  );

  const {
    data: readerData,
    error: readerError,
    isLoading: isReaderLoading,
  } = useSWR<ReaderPayload>(
    focusAllows(route, "reader") ? readerPath : null,
    fetchJson,
    { revalidateOnFocus: false },
  );

  const pushToast = (message: string, type: ToastType) => {
    const id = createToastId();
    setActiveToasts((previous) => [...previous, { id, message, type }]);
    window.setTimeout(() => {
      setActiveToasts((previous) => previous.filter((toast) => toast.id !== id));
    }, 4000);
  };

  const replaceSlice = <T,>(
    key: "bookmarks" | "collections" | "notes",
    updater: (items: T[]) => T[],
  ) => {
    if (!data) {
      return;
    }

    startTransition(() => {
      mutate(
        {
          ...data,
          [key]: {
            ...data[key],
            items: updater(data[key].items as T[]),
          },
        },
        false,
      );
    });
  };

  const createNote = async () => {
    if (!data?.isLoggedIn) {
      pushToast("Sign in first.", "error");
      return;
    }

    const verseKey = noteVerseKey.trim();
    const body = noteBody.trim();

    if (!verseKey || !body) {
      pushToast("Verse key and note body are required.", "error");
      return;
    }

    const temporary: NoteItem = {
      body,
      id: `temp-${createToastId()}`,
      ranges: [`${verseKey}-${verseKey}`],
    };

    const previous = data.notes.items;
    replaceSlice<NoteItem>("notes", (items) => [temporary, ...items]);

    try {
      const response = await mutationRequest<NoteItem>("/api/notes", "POST", {
        body,
        verseKey,
      });

      replaceSlice<NoteItem>("notes", (items) =>
        items.map((item) => (item.id === temporary.id ? response.item ?? item : item)),
      );
      setNoteBody("");
      pushToast(response.message ?? "Note created.", "success");
    } catch (error) {
      replaceSlice<NoteItem>("notes", () => previous);
      pushToast((error as MutationResult).message ?? "Failed to create note.", "error");
      await mutate();
    }
  };

  const deleteNote = async (noteId: string | null) => {
    if (!noteId) {
      return;
    }

    const previous = data?.notes.items ?? [];
    replaceSlice<NoteItem>("notes", (items) => items.filter((item) => item.id !== noteId));

    try {
      const response = await mutationRequest(`/api/notes/${noteId}`, "DELETE");
      pushToast(response.message ?? "Note deleted.", "success");
    } catch (error) {
      replaceSlice<NoteItem>("notes", () => previous);
      pushToast((error as MutationResult).message ?? "Failed to delete note.", "error");
      await mutate();
    }
  };

  const createBookmark = async () => {
    const chapterNumber = Number.parseInt(bookmarkChapter, 10);
    const verseNumber = Number.parseInt(bookmarkVerse, 10);

    if (!Number.isInteger(chapterNumber) || !Number.isInteger(verseNumber)) {
      pushToast("Bookmark chapter and verse must be valid numbers.", "error");
      return;
    }

    const temporary: BookmarkItem = {
      id: `temp-${createToastId()}`,
      readerUrl: `/read/${chapterNumber}`,
      type: "ayah",
      verseKey: `${chapterNumber}:${verseNumber}`,
    };

    const previous = data?.bookmarks.items ?? [];
    replaceSlice<BookmarkItem>("bookmarks", (items) => [temporary, ...items]);

    try {
      const response = await mutationRequest<BookmarkItem>("/api/bookmarks", "POST", {
        chapterNumber,
        verseNumber,
      });

      replaceSlice<BookmarkItem>("bookmarks", (items) =>
        items.map((item) => (item.id === temporary.id ? response.item ?? item : item)),
      );
      pushToast(response.message ?? "Bookmark created.", "success");
    } catch (error) {
      replaceSlice<BookmarkItem>("bookmarks", () => previous);
      pushToast((error as MutationResult).message ?? "Failed to create bookmark.", "error");
      await mutate();
    }
  };

  const deleteBookmark = async (bookmarkId: string | null) => {
    if (!bookmarkId) {
      return;
    }

    const previous = data?.bookmarks.items ?? [];
    replaceSlice<BookmarkItem>("bookmarks", (items) =>
      items.filter((item) => item.id !== bookmarkId),
    );

    try {
      const response = await mutationRequest(`/api/bookmarks/${bookmarkId}`, "DELETE");
      pushToast(response.message ?? "Bookmark deleted.", "success");
    } catch (error) {
      replaceSlice<BookmarkItem>("bookmarks", () => previous);
      pushToast((error as MutationResult).message ?? "Failed to delete bookmark.", "error");
      await mutate();
    }
  };

  const createCollection = async () => {
    const name = collectionName.trim();
    if (!name) {
      pushToast("Collection name is required.", "error");
      return;
    }

    const temporary: CollectionItem = {
      id: `temp-${createToastId()}`,
      name,
      updatedAt: new Date().toISOString(),
    };

    const previous = data?.collections.items ?? [];
    replaceSlice<CollectionItem>("collections", (items) => [temporary, ...items]);

    try {
      const response = await mutationRequest<CollectionItem>("/api/collections", "POST", {
        name,
      });
      replaceSlice<CollectionItem>("collections", (items) =>
        items.map((item) => (item.id === temporary.id ? response.item ?? item : item)),
      );
      setCollectionName("");
      pushToast(response.message ?? "Collection created.", "success");
    } catch (error) {
      replaceSlice<CollectionItem>("collections", () => previous);
      pushToast((error as MutationResult).message ?? "Failed to create collection.", "error");
      await mutate();
    }
  };

  const deleteCollection = async (collectionId: string | null) => {
    if (!collectionId) {
      return;
    }

    const previous = data?.collections.items ?? [];
    replaceSlice<CollectionItem>("collections", (items) =>
      items.filter((item) => item.id !== collectionId),
    );

    try {
      const response = await mutationRequest(`/api/collections/${collectionId}`, "DELETE");
      pushToast(response.message ?? "Collection deleted.", "success");
    } catch (error) {
      replaceSlice<CollectionItem>("collections", () => previous);
      pushToast((error as MutationResult).message ?? "Failed to delete collection.", "error");
      await mutate();
    }
  };

  const refreshUserSession = async () => {
    try {
      const response = await mutationRequest("/api/session/refresh", "POST");
      pushToast(response.message ?? "Session refreshed.", "success");
      await mutate();
    } catch (error) {
      pushToast((error as MutationResult).message ?? "Session refresh failed.", "error");
      await mutate();
    }
  };

  const submitGoalPayload = async () => {
    const payload = tryParseJsonObject(goalPayloadText);
    if (!payload) {
      pushToast("Goal payload must be a JSON object.", "error");
      return;
    }

    try {
      const response = await mutationRequest("/api/goals", "POST", { payload });
      pushToast(response.message ?? "Goal saved.", "success");
      await mutate();
    } catch (error) {
      pushToast((error as MutationResult).message ?? "Goal update failed.", "error");
    }
  };

  const submitPreferencesPayload = async () => {
    const payload = tryParseJsonObject(preferencesPayloadText);
    if (!payload) {
      pushToast("Preferences payload must be a JSON object.", "error");
      return;
    }

    try {
      const response = await mutationRequest("/api/preferences", "POST", { payload });
      pushToast(response.message ?? "Preferences updated.", "success");
      await mutate();
    } catch (error) {
      pushToast((error as MutationResult).message ?? "Preferences update failed.", "error");
    }
  };

  const createReflection = async () => {
    const body = reflectionBody.trim();
    const verseKey = reflectionVerseKey.trim();

    if (!body || !verseKey) {
      pushToast("Reflection body and verse key are required.", "error");
      return;
    }

    try {
      const response = await mutationRequest("/api/reflections", "POST", {
        body,
        verseKey,
      });
      pushToast(response.message ?? "Reflection posted.", "success");
      setReflectionBody("");
      await mutate();
    } catch (error) {
      pushToast((error as MutationResult).message ?? "Failed to create reflection.", "error");
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    setDebouncedQuery("");
    mutateSearch(
      {
        error: null,
        navigationItems: [],
        query: "",
        verseItems: [],
      },
      false,
    );
  };

  const jumpToReader = () => {
    if (!readerChapter.trim()) {
      return;
    }
    window.location.assign(`/read/${encodeURIComponent(readerChapter.trim())}`);
  };

  const showAuth = focusAllows(route, "auth");
  const showContent = focusAllows(route, "content");
  const showLibrary = focusAllows(route, "library");
  const showGoals = focusAllows(route, "goals");
  const showReflect = focusAllows(route, "reflect");
  const showSearch = focusAllows(route, "search");
  const showReader = focusAllows(route, "reader");

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.badge}>{starterConfig.app.shortName}</p>
        <h1 className={styles.title}>
          Build a full Quran app with SDK-powered auth and features.
        </h1>
        <p className={styles.subtitle}>
          User features use a logged-in session. Content and search use a separate app token on the server.
        </p>
      </header>

      <nav className={styles.nav}>
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            className={route === item.key ? styles.navActive : styles.navLink}
            href={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {bootstrapError && !data ? (
        <main className={styles.main}>
          <section className={styles.panel}>
            <h2>Starter data could not load.</h2>
            <p className={styles.errorText}>
              {getErrorMessage(bootstrapError, "Unable to load starter data.")}
            </p>
            <button
              className={styles.primaryButton}
              onClick={() => void mutate()}
              type="button"
            >
              Retry
            </button>
          </section>
        </main>
      ) : isLoading || !data ? (
        <main className={styles.main}>
          <section className={styles.panel}>
            <h2>Loading starter workspace...</h2>
            <p>Fetching bootstrap data from the backend.</p>
          </section>
        </main>
      ) : (
        <main className={styles.main}>
          {showAuth && (
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Authentication and session</h2>
                <div className={styles.rowActions}>
                  {data.isLoggedIn ? (
                    <>
                      <button className={styles.secondaryButton} onClick={refreshUserSession} type="button">
                        Refresh session
                      </button>
                      <a className={styles.primaryLink} href="/api/auth/logout">
                        Logout (OIDC)
                      </a>
                    </>
                  ) : (
                    <a className={styles.primaryLink} href="/api/auth/start">
                      Continue with Quran.com
                    </a>
                  )}
                </div>
              </div>
              <p className={styles.muted}>
                Tokens stay server-side. The browser receives only a signed session cookie.
              </p>

              <div className={styles.cardGrid}>
                <article className={styles.card}>
                  <h3>Session store</h3>
                  <p>{data.sessionStoreSummary}</p>
                </article>
                <article className={styles.card}>
                  <h3>Granted scopes</h3>
                  <p>{data.grantedScopes.length ? data.grantedScopes.join(" ") : "No scopes granted yet."}</p>
                </article>
                <article className={styles.card}>
                  <h3>ID token summary</h3>
                  {data.idTokenSummary ? (
                    <pre>{JSON.stringify(data.idTokenSummary, null, 2)}</pre>
                  ) : (
                    <p>No ID token summary is available.</p>
                  )}
                </article>
                <article className={styles.card}>
                  <h3>OIDC userinfo</h3>
                  {data.userInfo.error ? (
                    <p className={styles.errorText}>{data.userInfo.error}</p>
                  ) : (
                    <pre>{JSON.stringify(data.userInfo.data, null, 2)}</pre>
                  )}
                </article>
              </div>
            </section>
          )}

          {showContent && (
            <section className={styles.panel}>
              <h2>Quran content preview (app token)</h2>
              <p className={styles.muted}>
                Server-side content calls use client_credentials with the content scope.
              </p>
              {data.contentPreview.error ? (
                <p className={styles.errorText}>{data.contentPreview.error}</p>
              ) : (
                <div className={styles.listGrid}>
                  {data.contentPreview.items.map((chapter) => (
                    <Link key={chapter.id} className={styles.listCard} href={chapter.readerUrl}>
                      <strong>{chapter.nameSimple}</strong>
                      <span>{chapter.nameArabic ?? chapter.translatedName ?? "Quran chapter"}</span>
                      <small>{chapter.versesCount ? `${chapter.versesCount} verses` : "Open chapter"}</small>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {showSearch && (
            <section className={styles.panel}>
              <h2>Search (app token)</h2>
              <div className={styles.inlineForm}>
                <input
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder={starterConfig.defaults.searchPlaceholder}
                  type="search"
                  value={searchInput}
                />
                <button className={styles.secondaryButton} onClick={clearSearch} type="button">
                  Clear
                </button>
              </div>

              {isSearchLoading ? <p>Searching...</p> : null}
              {searchData?.error ? <p className={styles.errorText}>{searchData.error}</p> : null}

              {searchData?.navigationItems?.length ? (
                <div className={styles.results}>
                  <h3>Navigation results</h3>
                  {searchData.navigationItems.map((item, index) => (
                    <Link key={`${item.label}-${index}`} className={styles.resultRow} href={item.readerUrl ?? "/read/1"}>
                      <strong>{item.label ?? "Result"}</strong>
                      <span>{item.subtitle ?? "Open in reader"}</span>
                    </Link>
                  ))}
                </div>
              ) : null}

              {searchData?.verseItems?.length ? (
                <div className={styles.results}>
                  <h3>Verse results</h3>
                  {searchData.verseItems.map((item, index) => (
                    <Link key={`${item.verseKey}-${index}`} className={styles.resultRow} href={item.readerUrl ?? "/read/1"}>
                      <strong>{item.verseKey ?? "Verse"}</strong>
                      <span>{item.text ?? "Open result in reader"}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>
          )}

          {showReader && (
            <section className={styles.panel}>
              <h2>Reader</h2>
              <p className={styles.muted}>
                Reader data is fetched server-side through the SDK content API.
              </p>
              <div className={styles.inlineForm}>
                <input
                  inputMode="numeric"
                  onChange={(event) => setReaderChapter(event.target.value)}
                  placeholder="Chapter number"
                  value={readerChapter}
                />
                <button className={styles.secondaryButton} onClick={jumpToReader} type="button">
                  Open chapter
                </button>
              </div>
              {isReaderLoading ? <p>Loading chapter...</p> : null}
              {readerError ? <p className={styles.errorText}>Unable to load reader data.</p> : null}
              {readerData ? (
                <article className={styles.readerCard}>
                  <h3>
                    {readerData.chapter.nameSimple} {readerData.chapter.nameArabic ? `• ${readerData.chapter.nameArabic}` : ""}
                  </h3>
                  {readerData.verses.map((verse) => (
                    <div key={verse.id} className={styles.verseRow}>
                      <div className={styles.verseMeta}>{verse.verseKey ?? "Verse"}</div>
                      <p className={styles.arabic}>{verse.arabicText}</p>
                      <p className={styles.translation}>{verse.translationText ?? "No translation in this response."}</p>
                    </div>
                  ))}
                </article>
              ) : null}
            </section>
          )}

          {showLibrary && (
            <section className={styles.panel}>
              <h2>Library workspace (user session)</h2>
              <p className={styles.muted}>
                Notes, bookmarks, and collections use the logged-in user token and auto-refresh server-side.
              </p>
              <div className={styles.cardGrid}>
                <article className={styles.card}>
                  <h3>Create note</h3>
                  <input
                    onChange={(event) => setNoteVerseKey(event.target.value)}
                    placeholder="Verse key (e.g. 2:255)"
                    value={noteVerseKey}
                  />
                  <textarea
                    onChange={(event) => setNoteBody(event.target.value)}
                    placeholder="Write a short note."
                    value={noteBody}
                  />
                  <button className={styles.primaryButton} onClick={createNote} type="button">
                    Save note
                  </button>
                  {data.notes.error ? <p className={styles.errorText}>{data.notes.error}</p> : null}
                  {data.notes.gatingMessage ? <p className={styles.muted}>{data.notes.gatingMessage}</p> : null}
                  <div className={styles.stack}>
                    {data.notes.items.map((note) => (
                      <div key={note.id ?? `${note.body}-${note.ranges[0]}`} className={styles.itemRow}>
                        <div>
                          <strong>{note.ranges[0] ?? "Verse range"}</strong>
                          <p>{note.body}</p>
                        </div>
                        <button className={styles.textButton} onClick={() => deleteNote(note.id)} type="button">
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </article>

                <article className={styles.card}>
                  <h3>Create bookmark</h3>
                  <input
                    inputMode="numeric"
                    onChange={(event) => setBookmarkChapter(event.target.value)}
                    placeholder="Chapter number"
                    value={bookmarkChapter}
                  />
                  <input
                    inputMode="numeric"
                    onChange={(event) => setBookmarkVerse(event.target.value)}
                    placeholder="Verse number"
                    value={bookmarkVerse}
                  />
                  <button className={styles.primaryButton} onClick={createBookmark} type="button">
                    Save bookmark
                  </button>
                  {data.bookmarks.error ? <p className={styles.errorText}>{data.bookmarks.error}</p> : null}
                  {data.bookmarks.gatingMessage ? <p className={styles.muted}>{data.bookmarks.gatingMessage}</p> : null}
                  <div className={styles.stack}>
                    {data.bookmarks.items.map((bookmark) => (
                      <div key={bookmark.id ?? bookmark.verseKey} className={styles.itemRow}>
                        <Link href={bookmark.readerUrl ?? "/read/1"}>
                          {bookmark.verseKey} • {bookmark.type}
                        </Link>
                        <button className={styles.textButton} onClick={() => deleteBookmark(bookmark.id)} type="button">
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </article>

                <article className={styles.card}>
                  <h3>Create collection</h3>
                  <input
                    onChange={(event) => setCollectionName(event.target.value)}
                    placeholder="Collection name"
                    value={collectionName}
                  />
                  <button className={styles.primaryButton} onClick={createCollection} type="button">
                    Save collection
                  </button>
                  {data.collections.error ? <p className={styles.errorText}>{data.collections.error}</p> : null}
                  {data.collections.gatingMessage ? <p className={styles.muted}>{data.collections.gatingMessage}</p> : null}
                  <div className={styles.stack}>
                    {data.collections.items.map((collection) => (
                      <div key={collection.id ?? collection.name} className={styles.itemRow}>
                        <div>
                          <strong>{collection.name}</strong>
                          <p>{collection.updatedAt ? new Date(collection.updatedAt).toLocaleString() : "Recently updated"}</p>
                        </div>
                        <button
                          className={styles.textButton}
                          onClick={() => deleteCollection(collection.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </section>
          )}

          {showGoals && (
            <section className={styles.panel}>
              <h2>Goals and preferences (user session)</h2>
              <div className={styles.cardGrid}>
                <article className={styles.card}>
                  <h3>Current goal snapshot</h3>
                  {data.goals.error ? (
                    <p className={styles.errorText}>{data.goals.error}</p>
                  ) : (
                    <pre>{JSON.stringify(data.goals.data, null, 2)}</pre>
                  )}
                  <textarea
                    className={styles.codeArea}
                    onChange={(event) => setGoalPayloadText(event.target.value)}
                    value={goalPayloadText}
                  />
                  <button className={styles.primaryButton} onClick={submitGoalPayload} type="button">
                    Save goal payload
                  </button>
                </article>

                <article className={styles.card}>
                  <h3>Current preferences snapshot</h3>
                  {data.preferences.error ? (
                    <p className={styles.errorText}>{data.preferences.error}</p>
                  ) : (
                    <pre>{JSON.stringify(data.preferences.data, null, 2)}</pre>
                  )}
                  <textarea
                    className={styles.codeArea}
                    onChange={(event) => setPreferencesPayloadText(event.target.value)}
                    value={preferencesPayloadText}
                  />
                  <button className={styles.primaryButton} onClick={submitPreferencesPayload} type="button">
                    Save preferences payload
                  </button>
                </article>
              </div>
            </section>
          )}

          {showReflect && (
            <section className={styles.panel}>
              <h2>QuranReflect (user session)</h2>
              <div className={styles.cardGrid}>
                <article className={styles.card}>
                  <h3>Create reflection</h3>
                  <input
                    onChange={(event) => setReflectionVerseKey(event.target.value)}
                    placeholder="Verse key (e.g. 1:1)"
                    value={reflectionVerseKey}
                  />
                  <textarea
                    onChange={(event) => setReflectionBody(event.target.value)}
                    placeholder="Write a short reflection."
                    value={reflectionBody}
                  />
                  <button className={styles.primaryButton} onClick={createReflection} type="button">
                    Post reflection
                  </button>
                </article>
                <article className={styles.card}>
                  <h3>Profile</h3>
                  {data.quranReflect.profile.error ? (
                    <p className={styles.errorText}>{data.quranReflect.profile.error}</p>
                  ) : (
                    <pre>{JSON.stringify(data.quranReflect.profile.data, null, 2)}</pre>
                  )}
                </article>
              </div>

              <div className={styles.results}>
                <h3>Feed preview</h3>
                {data.quranReflect.feed.error ? (
                  <p className={styles.errorText}>{data.quranReflect.feed.error}</p>
                ) : (
                  data.quranReflect.feed.items.map((post) => (
                    <article key={post.id ?? `${post.authorName}-${post.body}`} className={styles.feedCard}>
                      <header>
                        <strong>{post.authorName}</strong>
                        <small>
                          {post.likesCount} likes • {post.commentsCount} comments
                        </small>
                      </header>
                      <p>{post.body}</p>
                      {post.referenceLabel && post.readerUrl ? (
                        <Link href={post.readerUrl}>{post.referenceLabel}</Link>
                      ) : null}
                    </article>
                  ))
                )}
              </div>
            </section>
          )}
        </main>
      )}

      <div className={styles.toastStack}>
        {activeToasts.map((toast) => (
          <div
            className={toast.type === "error" ? styles.toastError : styles.toastSuccess}
            key={toast.id}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
