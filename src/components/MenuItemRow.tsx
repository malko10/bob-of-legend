import { getAllergyInfo } from "@/lib/allergies";
import type { CheckedMenuItem } from "@/lib/types";

export function MenuItemRow({ item }: { item: CheckedMenuItem }) {
  if (item.isSafe) {
    return (
      <li className="flex items-center gap-2 px-1 py-1.5">
        <span className="text-sm text-zinc-700 dark:text-zinc-200">
          {item.name}
        </span>
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-red-200 bg-red-50/80 px-3 py-2 dark:border-red-900/50 dark:bg-red-950/30">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-red-500" aria-hidden>
          ⚠
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
            {item.name}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {item.matches.map((m) => {
              const info = getAllergyInfo(m.code);
              return (
                <span
                  key={m.code}
                  className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300"
                >
                  <span>{info.emoji}</span>
                  {m.name}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </li>
  );
}
