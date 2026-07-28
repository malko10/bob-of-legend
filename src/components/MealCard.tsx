import { checkMenu } from "@/lib/match";
import type { AllergyCode, Meal } from "@/lib/types";
import { MenuItemRow } from "./MenuItemRow";

const MEAL_ACCENT: Record<Meal["mealType"], { ring: string; label: string; emoji: string }> = {
  조식: { ring: "from-amber-400/20", label: "text-amber-600 dark:text-amber-400", emoji: "🌅" },
  중식: { ring: "from-emerald-400/20", label: "text-emerald-600 dark:text-emerald-400", emoji: "☀️" },
  석식: { ring: "from-indigo-400/20", label: "text-indigo-600 dark:text-indigo-400", emoji: "🌙" },
};

export function MealCard({
  meal,
  allergies,
}: {
  meal: Meal;
  allergies: AllergyCode[];
}) {
  const checked = checkMenu(meal.menu, allergies);
  const unsafeCount = checked.filter((i) => !i.isSafe).length;
  const accent = MEAL_ACCENT[meal.mealType];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent.ring} to-transparent`} />
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>{accent.emoji}</span>
            <h3 className={`text-base font-bold ${accent.label}`}>
              {meal.mealType}
            </h3>
          </div>
          {unsafeCount > 0 ? (
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">
              {unsafeCount}개 주의
            </span>
          ) : (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              안전
            </span>
          )}
        </div>

        <ul className="space-y-1">
          {checked.map((item) => (
            <MenuItemRow key={item.name} item={item} />
          ))}
        </ul>

        {(meal.calories || meal.origin) && (
          <div className="mt-4 space-y-1 border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            {meal.calories != null && <p>🔥 {meal.calories} kcal</p>}
            {meal.origin && <p className="leading-relaxed">📍 {meal.origin}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
