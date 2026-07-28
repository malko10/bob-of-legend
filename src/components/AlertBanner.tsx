import { summarizeAllergens } from "@/lib/match";
import type { AllergyCode, Meal } from "@/lib/types";

export function AlertBanner({
  meals,
  allergies,
}: {
  meals: Meal[];
  allergies: AllergyCode[];
}) {
  if (allergies.length === 0) return null;

  const allSummary = meals.flatMap((m) =>
    summarizeAllergens(m.menu, allergies),
  );
  const dedup = Array.from(
    new Map(allSummary.map((m) => [m.code, m])).values(),
  );

  if (dedup.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
        <span className="text-xl" aria-hidden>✅</span>
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          오늘 급식에 등록된 알레르기 유발 메뉴가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/30">
      <span className="mt-0.5 text-xl" aria-hidden>🚨</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">
          오늘 급식에서 알레르기 유발 성분이 감지되었습니다
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {dedup.map((m) => (
            <span
              key={m.code}
              className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300"
            >
              {m.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
