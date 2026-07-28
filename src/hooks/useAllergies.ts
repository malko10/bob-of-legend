"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { AllergyCode } from "@/lib/types";

const STORAGE_KEY = "sprout:allergies";

function readFromStorage(): AllergyCode[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c) => typeof c === "string") as AllergyCode[];
  } catch {
    return [];
  }
}

const EMPTY: AllergyCode[] = [];
let cached: AllergyCode[] = EMPTY;
let initialized = false;
const listeners = new Set<() => void>();

function ensureInitialized() {
  if (!initialized) {
    cached = readFromStorage();
    initialized = true;
  }
}

function getSnapshot(): AllergyCode[] {
  ensureInitialized();
  return cached;
}

function getServerSnapshot(): AllergyCode[] {
  return EMPTY;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      cached = readFromStorage();
      callback();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function commit(next: AllergyCode[]) {
  cached = next;
  initialized = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
  }
  for (const l of listeners) l();
}

const HYDRATE_SUBSCRIBE = () => () => {};
const HYDRATE_CLIENT = () => true;
const HYDRATE_SERVER = () => false;

export function useAllergies() {
  const allergies = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const hydrated = useSyncExternalStore(
    HYDRATE_SUBSCRIBE,
    HYDRATE_CLIENT,
    HYDRATE_SERVER,
  );

  const toggle = useCallback(
    (code: AllergyCode) => {
      commit(
        allergies.includes(code)
          ? allergies.filter((c) => c !== code)
          : [...allergies, code],
      );
    },
    [allergies],
  );

  const clearAll = useCallback(() => commit([]), []);

  return { allergies, toggle, clearAll, hydrated };
}
