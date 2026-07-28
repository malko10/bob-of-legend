"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { SelectedSchool } from "@/lib/types";

const STORAGE_KEY = "bob:school";

function readFromStorage(): SelectedSchool | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.officeCode === "string" &&
      typeof parsed.schoolCode === "string" &&
      typeof parsed.name === "string"
    ) {
      return {
        officeCode: parsed.officeCode,
        schoolCode: parsed.schoolCode,
        name: parsed.name,
        region: typeof parsed.region === "string" ? parsed.region : "",
      };
    }
    return null;
  } catch {
    return null;
  }
}

let cached: SelectedSchool | null = null;
let initialized = false;
const listeners = new Set<() => void>();

function ensureInitialized() {
  if (!initialized) {
    cached = readFromStorage();
    initialized = true;
  }
}

function getSnapshot(): SelectedSchool | null {
  ensureInitialized();
  return cached;
}

function getServerSnapshot(): SelectedSchool | null {
  return null;
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

function commit(next: SelectedSchool | null) {
  cached = next;
  initialized = true;
  try {
    if (next) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
  }
  for (const l of listeners) l();
}

const HYDRATE_SUBSCRIBE = () => () => {};
const HYDRATE_CLIENT = () => true;
const HYDRATE_SERVER = () => false;

export function useSchool() {
  const school = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(
    HYDRATE_SUBSCRIBE,
    HYDRATE_CLIENT,
    HYDRATE_SERVER,
  );

  const select = useCallback((s: SelectedSchool) => commit(s), []);
  const clear = useCallback(() => commit(null), []);

  return { school, select, clear, hydrated };
}
