"use client";

import { useEffect, useState } from "react";
import { todayYYYYMMDD } from "@/lib/meal-service";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function CalendarPopover({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (yyyymmdd: string) => void;
  onClose: () => void;
}) {
  const initialY = Number(value.slice(0, 4));
  const initialM = Number(value.slice(4, 6)) - 1;
  const [view, setView] = useState({ y: initialY, m: initialM });

  const today = todayYYYYMMDD();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const firstDay = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () =>
    setView((v) => {
      const m = v.m - 1;
      return m < 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m };
    });
  const nextMonth = () =>
    setView((v) => {
      const m = v.m + 1;
      return m > 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m };
    });

  const pick = (d: number) => {
    const yyyymmdd = `${view.y}${String(view.m + 1).padStart(2, "0")}${String(d).padStart(2, "0")}`;
    onChange(yyyymmdd);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="absolute left-1/2 top-1/2 w-[20rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="날짜 선택"
      >
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="이전 달"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            ‹
          </button>
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {view.y}년 {view.m + 1}월
          </span>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="다음 달"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            ›
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="py-1 text-xs font-semibold text-zinc-400 dark:text-zinc-500"
            >
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />;
            const yyyymmdd = `${view.y}${String(view.m + 1).padStart(2, "0")}${String(d).padStart(2, "0")}`;
            const isToday = yyyymmdd === today;
            const isSelected = yyyymmdd === value;
            return (
              <button
                key={i}
                type="button"
                onClick={() => pick(d)}
                className={[
                  "aspect-square rounded-xl text-sm transition-colors",
                  isSelected
                    ? "bg-emerald-600 font-bold text-white"
                    : isToday
                      ? "bg-emerald-50 font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
                ].join(" ")}
              >
                {d}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => {
              onChange(today);
              onClose();
            }}
            className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            오늘
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
