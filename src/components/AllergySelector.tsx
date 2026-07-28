"use client";

import { ALLERGIES } from "@/lib/allergies";
import { useAllergies } from "@/hooks/useAllergies";
import type { AllergyCode } from "@/lib/types";

export function AllergySelector() {
  const { allergies, toggle, hydrated } = useAllergies();

  if (!hydrated) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {ALLERGIES.slice(0, 10).map((a) => (
          <div
            key={a.code}
            className="h-16 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {allergies.length > 0
            ? `${allergies.length}개 알레르기 성분 선택됨`
            : "해당하는 알레르기를 모두 선택해 주세요"}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {ALLERGIES.map((a) => {
          const selected = allergies.includes(a.code as AllergyCode);
          return (
            <button
              key={a.code}
              type="button"
              onClick={() => toggle(a.code as AllergyCode)}
              aria-pressed={selected}
              className={[
                "group flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-center transition-all",
                selected
                  ? "border-red-300 bg-red-50 shadow-sm dark:border-red-900/60 dark:bg-red-950/40"
                  : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800",
              ].join(" ")}
            >
              <span className="text-xl leading-none">{a.emoji}</span>
              <span
                className={[
                  "text-xs font-medium leading-tight",
                  selected
                    ? "text-red-700 dark:text-red-300"
                    : "text-zinc-700 dark:text-zinc-300",
                ].join(" ")}
              >
                {a.name}
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                {a.code}번
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
