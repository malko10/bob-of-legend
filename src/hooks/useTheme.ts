"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "bob:theme";

function systemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "light" || raw === "dark") return raw;
  } catch {
  }
  return systemTheme();
}

let cached: Theme = "light";
let initialized = false;
const listeners = new Set<() => void>();

function ensureInitialized() {
  if (!initialized) {
    cached = readTheme();
    initialized = true;
  }
}

function getSnapshot(): Theme {
  ensureInitialized();
  return cached;
}

function getServerSnapshot(): Theme {
  return "light";
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      cached = readTheme();
      callback();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function applyClass(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

function commit(theme: Theme) {
  cached = theme;
  initialized = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
  }
  applyClass(theme);
  for (const l of listeners) l();
}

const HYDRATE_SUBSCRIBE = () => () => {};
const HYDRATE_CLIENT = () => true;
const HYDRATE_SERVER = () => false;

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const hydrated = useSyncExternalStore(
    HYDRATE_SUBSCRIBE,
    HYDRATE_CLIENT,
    HYDRATE_SERVER,
  );

  const toggle = useCallback(() => {
    commit(cached === "dark" ? "light" : "dark");
  }, []);

  const setTheme = useCallback((t: Theme) => commit(t), []);

  return { theme, toggle, setTheme, hydrated };
}
