"use client";

import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggle, hydrated } = useTheme();

  if (!hydrated) {
    return <div className="h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "밝은 테마로 전환" : "어두운 테마로 전환"}
      title={isDark ? "밝은 테마" : "어두운 테마"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-base transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
